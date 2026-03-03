#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, parse, resolve, extname } from 'path';

// --- Parse args ---
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
auto-cut — автомонтаж: футажи + аудио → FCPXML timeline

Использование:
  auto-cut --footage <папка> --audio <файл> [опции]

Папка футажей:
  Видеофайлы (mp4/mov/mts) + footage.md с описаниями:
    ## 001.mp4
    Макс за компьютером, печатает код
    
    ## 002.mp4
    Общий план офиса, камера панорамирует

  Если footage.md нет — используются имена файлов.

Опции:
  --footage <path>      Папка с футажами (обязательно)
  --audio <path>        Аудиодорожка (обязательно)
  -o, --output <path>   Выходной файл (default: timeline.fcpxml)
  --min-clip <sec>      Мин. длина клипа (default: 2)
  --max-clip <sec>      Макс. длина клипа (default: 8)
  --lang <code>         Язык Whisper (default: ru)
  --model <name>        Модель Whisper (default: small)
  --fps <n>             Framerate (default: auto из первого футажа)
  --resolution <WxH>    Разрешение (default: auto из первого футажа)
  --manual              Без LLM — чередует футажи по порядку
`);
  process.exit(0);
}

function getArg(flag, def) {
  const i = args.indexOf(flag);
  if (i !== -1 && args[i + 1]) return args[i + 1];
  return def;
}
const hasFlag = (f) => args.includes(f);

const footageDir = resolve(getArg('--footage', ''));
const audioFile = resolve(getArg('--audio', ''));
const outputFile = resolve(getArg('--output', getArg('-o', 'timeline.fcpxml')));
const minClip = parseFloat(getArg('--min-clip', '2'));
const maxClip = parseFloat(getArg('--max-clip', '8'));
const lang = getArg('--lang', 'ru');
const whisperModel = getArg('--model', 'small');
const manualMode = hasFlag('--manual');

if (!footageDir || !existsSync(footageDir)) {
  console.error('❌ Укажи --footage <папка с футажами>');
  process.exit(1);
}
if (!audioFile || !existsSync(audioFile)) {
  console.error('❌ Укажи --audio <аудиофайл>');
  process.exit(1);
}

const VIDEO_EXTS = ['.mp4', '.mov', '.mts', '.avi', '.mkv', '.m4v', '.webm'];

// --- Scan footage ---
console.log('📂 Сканирую футажи...');
const files = readdirSync(footageDir)
  .filter(f => VIDEO_EXTS.includes(extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.error('❌ Нет видеофайлов в папке');
  process.exit(1);
}

// Read descriptions
const descFile = join(footageDir, 'footage.md');
const descriptions = {};
if (existsSync(descFile)) {
  const descContent = readFileSync(descFile, 'utf8');
  const blocks = descContent.split(/^## /m).filter(Boolean);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const filename = lines[0].trim();
    const desc = lines.slice(1).join(' ').trim();
    descriptions[filename] = desc;
  }
}

// Get footage info via ffprobe
const footage = [];
for (const f of files) {
  const fullPath = join(footageDir, f);
  try {
    const probeJson = execSync(`ffprobe -v quiet -print_format json -show_streams -show_format "${fullPath}"`, { encoding: 'utf8' });
    const probe = JSON.parse(probeJson);
    const vs = probe.streams.find(s => s.codec_type === 'video');
    const dur = parseFloat(probe.format.duration) || 0;
    footage.push({
      file: f,
      path: fullPath,
      duration: dur,
      width: vs ? parseInt(vs.width) : 1920,
      height: vs ? parseInt(vs.height) : 1080,
      fps: vs && vs.r_frame_rate ? eval(vs.r_frame_rate) : 30,
      description: descriptions[f] || f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    });
  } catch (e) {
    console.warn(`  ⚠️ Пропускаю ${f}: ${e.message}`);
  }
}

console.log(`   ${footage.length} футажей найдено`);
footage.forEach((f, i) => console.log(`   ${i + 1}. ${f.file} (${f.duration.toFixed(1)}s) — ${f.description.substring(0, 60)}`));

// Determine resolution/fps from first footage or args
let fps = parseFloat(getArg('--fps', '0')) || footage[0].fps;
const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
fps = commonRates.reduce((prev, curr) => Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev);

const resArg = getArg('--resolution', '');
let width, height;
if (resArg && resArg.includes('x')) {
  [width, height] = resArg.split('x').map(Number);
} else {
  width = footage[0].width;
  height = footage[0].height;
}

// --- Transcribe audio ---
console.log('🎤 Транскрипция аудио...');
const tmpDir = mkdtempSync(join(tmpdir(), 'autocut-'));
execSync(
  `whisper "${audioFile}" --model ${whisperModel} --language ${lang} --output_format json --output_dir "${tmpDir}" --word_timestamps True`,
  { stdio: 'inherit' }
);

const audioBasename = parse(audioFile).name;
const jsonFile = join(tmpDir, audioBasename + '.json');
const whisperData = JSON.parse(readFileSync(jsonFile, 'utf8'));

// Get audio duration
const audioDuration = parseFloat(
  execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioFile}"`, { encoding: 'utf8' }).trim()
);

console.log(`   Аудио: ${audioDuration.toFixed(1)}s, ${whisperData.segments.length} сегментов`);

// --- Build timeline segments ---
// Split audio into chunks of minClip-maxClip seconds
console.log('🎬 Строю таймлайн...');

const timelineChunks = [];
let currentStart = 0;

// Group whisper segments into timeline chunks
const whisperSegments = whisperData.segments;
let segIdx = 0;

while (currentStart < audioDuration) {
  // Collect segments for this chunk
  let chunkEnd = Math.min(currentStart + maxClip, audioDuration);
  let chunkText = '';
  
  while (segIdx < whisperSegments.length && whisperSegments[segIdx].start < chunkEnd) {
    const seg = whisperSegments[segIdx];
    if (seg.end <= currentStart) { segIdx++; continue; }
    chunkText += seg.text + ' ';
    // Try to end at segment boundary
    if (seg.end - currentStart >= minClip && seg.end - currentStart <= maxClip) {
      chunkEnd = seg.end;
    }
    segIdx++;
  }
  
  // If no segments found, just advance
  if (!chunkText.trim()) {
    chunkEnd = Math.min(currentStart + maxClip, audioDuration);
  }
  
  const dur = chunkEnd - currentStart;
  if (dur < 0.1) break;
  
  timelineChunks.push({
    start: currentStart,
    end: chunkEnd,
    duration: dur,
    text: chunkText.trim()
  });
  
  currentStart = chunkEnd;
}

console.log(`   ${timelineChunks.length} чанков в таймлайне`);

// --- Match chunks to footage ---
let assignments;

if (manualMode || footage.length <= 2) {
  // Simple round-robin
  console.log('📎 Режим чередования (round-robin)...');
  assignments = timelineChunks.map((chunk, i) => ({
    ...chunk,
    footage: footage[i % footage.length]
  }));
} else {
  // LLM matching via OpenClaw gateway
  console.log('🧠 Подбираю футажи по смыслу (LLM)...');
  
  const footageList = footage.map((f, i) => `${i + 1}. ${f.file}: ${f.description}`).join('\n');
  const chunkList = timelineChunks.map((c, i) => `${i + 1}. [${c.start.toFixed(1)}s-${c.end.toFixed(1)}s] "${c.text.substring(0, 100)}"`).join('\n');
  
  const prompt = `Ты монтажёр. Подбери футажи к аудиосегментам по смыслу.

ФУТАЖИ:
${footageList}

АУДИО СЕГМЕНТЫ:
${chunkList}

Ответь ТОЛЬКО JSON массивом чисел — номер футажа для каждого сегмента.
Пример для 5 сегментов: [1, 3, 2, 1, 4]
Старайся не ставить один и тот же футаж подряд. Если текст про код/компьютер — выбирай соответствующий футаж. Если общие слова — выбирай общие планы.`;

  try {
    // Use node to call OpenClaw or fallback to simple matching
    const matchResult = execSync(`openclaw chat -m sonnet46 -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" --no-stream 2>/dev/null || echo "FALLBACK"`, 
      { encoding: 'utf8', timeout: 60000 }).trim();
    
    if (matchResult === 'FALLBACK' || !matchResult.includes('[')) {
      throw new Error('LLM unavailable');
    }
    
    // Extract JSON array from response
    const jsonMatch = matchResult.match(/\[[\d,\s]+\]/);
    if (jsonMatch) {
      const indices = JSON.parse(jsonMatch[0]);
      assignments = timelineChunks.map((chunk, i) => ({
        ...chunk,
        footage: footage[(indices[i] || 1) - 1] || footage[i % footage.length]
      }));
    } else {
      throw new Error('No JSON in response');
    }
  } catch (e) {
    console.log(`   ⚠️ LLM недоступен, использую round-robin: ${e.message}`);
    assignments = timelineChunks.map((chunk, i) => ({
      ...chunk,
      footage: footage[i % footage.length]
    }));
  }
}

// Show assignments
assignments.forEach((a, i) => {
  console.log(`   ${i + 1}. [${a.start.toFixed(1)}-${a.end.toFixed(1)}s] → ${a.footage.file}`);
});

// --- Generate FCPXML ---
console.log('📄 Генерирую FCPXML...');

function toFcpTime(sec) {
  const frames = Math.round(sec * fps);
  return `${frames}/${fps}s`;
}

// Resources: format + each footage as asset
const assetRefs = footage.map((f, i) => {
  const id = `r${i + 10}`;
  return `        <asset id="${id}" name="${parse(f.file).name}" src="file://${f.path}" start="0s" duration="${toFcpTime(f.duration)}" hasVideo="1" hasAudio="1" format="r1"/>`;
});

// Audio asset
const audioAssetId = 'r_audio';
const audioAsset = `        <asset id="${audioAssetId}" name="${parse(audioFile).name}" src="file://${audioFile}" start="0s" duration="${toFcpTime(audioDuration)}" hasAudio="1"/>`;

// Video clips on spine
let spineOffset = 0;
const videoClips = assignments.map((a, i) => {
  const assetId = `r${footage.indexOf(a.footage) + 10}`;
  const clipDur = toFcpTime(a.duration);
  const clipOffset = toFcpTime(spineOffset);
  // Use a portion of the footage (start from beginning or random offset if footage is longer)
  const footageStart = '0s';
  spineOffset += a.duration;
  
  return `                <asset-clip ref="${assetId}" offset="${clipOffset}" name="${parse(a.footage.file).name}" duration="${clipDur}" start="${footageStart}" format="r1"/>`;
}).join('\n');

// Audio clip spanning full timeline
const audioClip = `                <asset-clip ref="${audioAssetId}" offset="0s" name="${parse(audioFile).name}" duration="${toFcpTime(audioDuration)}" start="0s" lane="-1"/>`;

const totalDur = toFcpTime(audioDuration);

const fcpxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.11">
    <resources>
        <format id="r1" name="FFVideoFormat${height}p${Math.round(fps)}" frameDuration="${toFcpTime(1 / fps)}" width="${width}" height="${height}"/>
${assetRefs.join('\n')}
${audioAsset}
    </resources>
    <library>
        <event name="Auto Cut">
            <project name="Timeline - ${parse(audioFile).name}">
                <sequence format="r1" duration="${totalDur}" tcStart="0s" tcFormat="NDF">
                    <spine>
${videoClips}
                    </spine>
                    <spine lane="-1">
                        <asset-clip ref="${audioAssetId}" offset="0s" name="Audio" duration="${totalDur}" start="0s"/>
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

writeFileSync(outputFile, fcpxml);
console.log(`\n✅ FCPXML: ${outputFile}`);
console.log(`🎬 Импортируй в Final Cut Pro. Аудио на отдельном lane.`);
