#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, parse, resolve, extname } from 'path';

// --- Parse args ---
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
auto-assemble — полная сборка видео: футажи + аудио → FCPXML с субтитрами

Объединяет auto-cut (монтаж) и auto-subs (субтитры) в один проект.
Результат: готовый FCPXML для импорта в Final Cut Pro → рендер.

Использование:
  auto-assemble --footage <папка> --audio <файл> [опции]

Обязательные:
  --footage <path>      Папка с футажами + footage.md
  --audio <path>        Аудиодорожка (голос)

Монтаж:
  --min-clip <sec>      Мин. длина клипа (default: 2)
  --max-clip <sec>      Макс. длина клипа (default: 8)
  --manual              Без LLM — чередует футажи по порядку

Субтитры:
  --no-subs             Без субтитров
  --font <name>         Шрифт (default: "Arial Bold")
  --font-size <n>       Размер шрифта (default: 72)
  --font-color <hex>    Цвет текста (default: "#FFFFFF")
  --stroke <hex>        Обводка (default: "#000000")
  --sub-position <pos>  top/center/bottom (default: bottom)
  --sub-mode <mode>     words/phrases (default: phrases)
  --max-words <n>       Макс слов в фразе (default: 8)

Whisper:
  --lang <code>         Язык (default: ru)
  --model <name>        Модель Whisper (default: small)

Видео:
  --fps <n>             Framerate (default: auto)
  --resolution <WxH>    Разрешение (default: auto)

Выход:
  -o, --output <path>   Выходной FCPXML (default: project.fcpxml)
  --srt <path>          Путь к SRT (default: рядом с output)

Пример:
  auto-assemble --footage ./footage/ --audio voice.m4a -o project.fcpxml
  auto-assemble --footage ./footage/ --audio voice.m4a --no-subs --manual
  auto-assemble --footage ./f/ --audio v.m4a --font "Montserrat" --font-size 64 --font-color "#FFD700"
`);
  process.exit(0);
}

function getArg(flag, def) {
  const i = args.indexOf(flag);
  if (i !== -1 && args[i + 1]) return args[i + 1];
  return def;
}
const hasFlag = (f) => args.includes(f);

// --- Config ---
const footageDir = resolve(getArg('--footage', ''));
const audioFile = resolve(getArg('--audio', ''));
const outputFile = resolve(getArg('--output', getArg('-o', 'project.fcpxml')));
const outputParsed = parse(outputFile);
const srtFile = resolve(getArg('--srt', join(outputParsed.dir, outputParsed.name + '.srt')));

const minClip = parseFloat(getArg('--min-clip', '2'));
const maxClip = parseFloat(getArg('--max-clip', '8'));
const manualMode = hasFlag('--manual');

const enableSubs = !hasFlag('--no-subs');
const font = getArg('--font', 'Arial Bold');
const fontSize = parseInt(getArg('--font-size', '72'));
const fontColor = getArg('--font-color', '#FFFFFF');
const strokeColor = getArg('--stroke', '#000000');
const subPosition = getArg('--sub-position', 'bottom');
const subMode = getArg('--sub-mode', 'phrases');
const maxWords = parseInt(getArg('--max-words', '8'));

const lang = getArg('--lang', 'ru');
const whisperModel = getArg('--model', 'small');

const VIDEO_EXTS = ['.mp4', '.mov', '.mts', '.avi', '.mkv', '.m4v', '.webm'];

// --- Validate ---
if (!footageDir || !existsSync(footageDir)) {
  console.error('❌ Укажи --footage <папка с футажами>');
  process.exit(1);
}
if (!audioFile || !existsSync(audioFile)) {
  console.error('❌ Укажи --audio <аудиофайл>');
  process.exit(1);
}

// --- Banner ---
console.log('');
console.log('🎬 auto-assemble — полная сборка видеопроекта');
console.log('═══════════════════════════════════════════════');
console.log('');

// ============================================================
// STEP 1: Scan footage
// ============================================================
console.log('📂 Шаг 1/5 — Сканирую футажи...');

const files = readdirSync(footageDir)
  .filter(f => VIDEO_EXTS.includes(extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.error('❌ Нет видеофайлов в папке');
  process.exit(1);
}

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
  console.log(`   📝 footage.md: ${Object.keys(descriptions).length} описаний`);
}

const footage = [];
for (const f of files) {
  const fullPath = join(footageDir, f);
  try {
    const probeJson = execSync(
      `ffprobe -v quiet -print_format json -show_streams -show_format "${fullPath}"`,
      { encoding: 'utf8' }
    );
    const probe = JSON.parse(probeJson);
    const vs = probe.streams.find(s => s.codec_type === 'video');
    const dur = parseFloat(probe.format.duration) || 0;
    let fileFps = 30;
    if (vs && vs.r_frame_rate) {
      const [num, den] = vs.r_frame_rate.split('/').map(Number);
      fileFps = den ? num / den : num;
    }
    footage.push({
      file: f, path: fullPath, duration: dur,
      width: vs ? parseInt(vs.width) : 1920,
      height: vs ? parseInt(vs.height) : 1080,
      fps: fileFps,
      description: descriptions[f] || f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    });
  } catch (e) {
    console.warn(`   ⚠️  Пропускаю ${f}: ${e.message}`);
  }
}

console.log(`   ✅ ${footage.length} футажей`);
footage.forEach((f, i) => {
  console.log(`      ${i + 1}. ${f.file} (${f.duration.toFixed(1)}s) — ${f.description.substring(0, 50)}`);
});

let fps = parseFloat(getArg('--fps', '0')) || footage[0].fps;
const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
fps = commonRates.reduce((prev, curr) =>
  Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev
);

const resArg = getArg('--resolution', '');
let width, height;
if (resArg && resArg.includes('x')) {
  [width, height] = resArg.split('x').map(Number);
} else {
  width = footage[0].width;
  height = footage[0].height;
}

console.log(`   📐 Проект: ${width}x${height} @ ${fps}fps`);

// ============================================================
// STEP 2: Transcribe audio
// ============================================================
console.log('');
console.log('🎤 Шаг 2/5 — Транскрипция аудио...');

const tmpDir = mkdtempSync(join(tmpdir(), 'assemble-'));
execSync(
  `whisper "${audioFile}" --model ${whisperModel} --language ${lang} --output_format json --output_dir "${tmpDir}" --word_timestamps True`,
  { stdio: 'inherit' }
);

const audioBasename = parse(audioFile).name;
const jsonFile = join(tmpDir, audioBasename + '.json');
const whisperData = JSON.parse(readFileSync(jsonFile, 'utf8'));

const audioDuration = parseFloat(
  execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioFile}"`, { encoding: 'utf8' }).trim()
);

console.log(`   ✅ ${audioDuration.toFixed(1)}s, ${whisperData.segments.length} сегментов`);

// ============================================================
// STEP 3: Build timeline
// ============================================================
console.log('');
console.log('🎬 Шаг 3/5 — Строю таймлайн...');

const timelineChunks = [];
let currentStart = 0;
const whisperSegments = whisperData.segments;
let segIdx = 0;

while (currentStart < audioDuration) {
  let chunkEnd = Math.min(currentStart + maxClip, audioDuration);
  let chunkText = '';

  while (segIdx < whisperSegments.length && whisperSegments[segIdx].start < chunkEnd) {
    const seg = whisperSegments[segIdx];
    if (seg.end <= currentStart) { segIdx++; continue; }
    chunkText += seg.text + ' ';
    if (seg.end - currentStart >= minClip && seg.end - currentStart <= maxClip) {
      chunkEnd = seg.end;
    }
    segIdx++;
  }

  if (!chunkText.trim()) {
    chunkEnd = Math.min(currentStart + maxClip, audioDuration);
  }

  const dur = chunkEnd - currentStart;
  if (dur < 0.1) break;

  timelineChunks.push({ start: currentStart, end: chunkEnd, duration: dur, text: chunkText.trim() });
  currentStart = chunkEnd;
}

console.log(`   ${timelineChunks.length} чанков`);

// Match to footage
let assignments;

if (manualMode || footage.length <= 2) {
  console.log('   📎 Round-robin...');
  assignments = timelineChunks.map((chunk, i) => ({
    ...chunk, footage: footage[i % footage.length]
  }));
} else {
  console.log('   🧠 Подбираю по смыслу (LLM)...');

  const footageList = footage.map((f, i) => `${i + 1}. ${f.file}: ${f.description}`).join('\n');
  const chunkList = timelineChunks.map((c, i) =>
    `${i + 1}. [${c.start.toFixed(1)}s-${c.end.toFixed(1)}s] "${c.text.substring(0, 100)}"`
  ).join('\n');

  const prompt = `Ты монтажёр. Подбери футажи к аудиосегментам по смыслу.

ФУТАЖИ:
${footageList}

АУДИО СЕГМЕНТЫ:
${chunkList}

Ответь ТОЛЬКО JSON массивом чисел — номер футажа для каждого сегмента.
Пример: [1, 3, 2, 1, 4]
Не ставь один футаж подряд больше 2 раз. Подбирай по контексту текста.`;

  try {
    const escaped = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const matchResult = execSync(
      `openclaw chat -m sonnet46 -p "${escaped}" --no-stream 2>/dev/null || echo "FALLBACK"`,
      { encoding: 'utf8', timeout: 60000 }
    ).trim();

    if (matchResult === 'FALLBACK' || !matchResult.includes('[')) {
      throw new Error('LLM unavailable');
    }

    const jsonMatch = matchResult.match(/\[[\d,\s]+\]/);
    if (jsonMatch) {
      const indices = JSON.parse(jsonMatch[0]);
      assignments = timelineChunks.map((chunk, i) => ({
        ...chunk, footage: footage[(indices[i] || 1) - 1] || footage[i % footage.length]
      }));
    } else {
      throw new Error('No JSON array');
    }
  } catch (e) {
    console.log(`   ⚠️  LLM fallback → round-robin: ${e.message}`);
    assignments = timelineChunks.map((chunk, i) => ({
      ...chunk, footage: footage[i % footage.length]
    }));
  }
}

assignments.forEach((a, i) => {
  console.log(`   ${String(i + 1).padStart(3)}. [${a.start.toFixed(1)}-${a.end.toFixed(1)}s] → ${a.footage.file}`);
});

// ============================================================
// STEP 4: Subtitles
// ============================================================
let subtitleSegments = [];

if (enableSubs) {
  console.log('');
  console.log('📝 Шаг 4/5 — Субтитры...');

  const allWords = [];
  for (const seg of whisperData.segments) {
    if (seg.words) {
      for (const w of seg.words) allWords.push({ start: w.start, end: w.end, text: w.word.trim() });
    } else {
      allWords.push({ start: seg.start, end: seg.end, text: seg.text.trim() });
    }
  }

  if (subMode === 'words') {
    subtitleSegments = allWords;
  } else {
    for (let i = 0; i < allWords.length;) {
      const chunk = allWords.slice(i, i + maxWords);
      subtitleSegments.push({
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
        text: chunk.map(w => w.text).join(' ')
      });
      i += maxWords;
    }
  }

  console.log(`   ✅ ${subtitleSegments.length} субтитров (${subMode})`);

  // Generate SRT
  let srt = '';
  subtitleSegments.forEach((seg, i) => {
    const toSrt = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.round((sec % 1) * 1000);
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
    };
    srt += `${i + 1}\n${toSrt(seg.start)} --> ${toSrt(seg.end)}\n${seg.text}\n\n`;
  });

  writeFileSync(srtFile, srt);
  console.log(`   💾 SRT: ${srtFile}`);
} else {
  console.log('');
  console.log('📝 Шаг 4/5 — Субтитры пропущены (--no-subs)');
}

// ============================================================
// STEP 5: Generate FCPXML
// ============================================================
console.log('');
console.log('📄 Шаг 5/5 — Генерирую FCPXML...');

function toFcpTime(sec) {
  const frames = Math.round(sec * fps);
  return `${frames}/${fps}s`;
}

function hexToFcpColor(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
  return `${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} ${a.toFixed(4)}`;
}

// Resources
const footageAssets = footage.map((f, i) =>
  `        <asset id="r${i + 10}" name="${parse(f.file).name}" src="file://${f.path}" start="0s" duration="${toFcpTime(f.duration)}" hasVideo="1" hasAudio="1" format="r1"/>`
);

const audioAssetId = 'r_audio';
const audioAsset = `        <asset id="${audioAssetId}" name="${parse(audioFile).name}" src="file://${audioFile}" start="0s" duration="${toFcpTime(audioDuration)}" hasAudio="1"/>`;

const titleEffect = enableSubs
  ? `        <effect id="r_title" name="Basic Title" uid=".../Titles.localized/Bumper:Opener.localized/Basic Title.localized/Basic Title.moti"/>`
  : '';

// Video clips on main spine — mute original audio
let spineOffset = 0;
const videoClips = assignments.map((a) => {
  const assetId = `r${footage.indexOf(a.footage) + 10}`;
  const clipDur = toFcpTime(a.duration);
  const clipOffset = toFcpTime(spineOffset);
  
  // Vary footage start for variety (golden ratio offset)
  const footageDur = a.footage.duration;
  let footageStart = 0;
  if (footageDur > a.duration + 2) {
    footageStart = (spineOffset * 1.618) % Math.max(0.1, footageDur - a.duration);
  }
  const startTime = toFcpTime(footageStart);
  spineOffset += a.duration;

  return `                <asset-clip ref="${assetId}" offset="${clipOffset}" name="${parse(a.footage.file).name}" duration="${clipDur}" start="${startTime}" format="r1">
                    <adjust-volume amount="-96dB"/>
                </asset-clip>`;
}).join('\n');

// Audio on lane -1
const audioOnTimeline = `                <asset-clip ref="${audioAssetId}" offset="0s" name="Audio" duration="${toFcpTime(audioDuration)}" start="0s"/>`;

// Subtitles on lane 1
const posY = subPosition === 'top' ? '85' : subPosition === 'center' ? '0' : '-85';
const textFcpColor = hexToFcpColor(fontColor);
const strokeFcpClr = hexToFcpColor(strokeColor);

let subtitleXml = '';
if (enableSubs && subtitleSegments.length > 0) {
  const titles = subtitleSegments.map((seg, i) => {
    const escaped = seg.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    return `                <title ref="r_title" lane="1" offset="${toFcpTime(seg.start)}" name="Sub ${i + 1}" duration="${toFcpTime(seg.end - seg.start)}" start="0s">
                    <param name="Position" key="9999/999166631/999166633/1/100/101" value="0 ${posY}"/>
                    <param name="Flatten" key="9999/999166631/999166633/2/351" value="1"/>
                    <param name="Alignment" key="9999/999166631/999166633/2/354/999169573/401" value="1 (Center)"/>
                    <text>
                        <text-style ref="ts${i}">${escaped}</text-style>
                    </text>
                    <text-style-def id="ts${i}">
                        <text-style font="${font}" fontSize="${fontSize}" fontFace="Regular" fontColor="${textFcpColor}" strokeColor="${strokeFcpClr}" strokeWidth="3" bold="1"/>
                    </text-style-def>
                </title>`;
  }).join('\n');
  subtitleXml = titles;
}

// Assemble
const totalDur = toFcpTime(audioDuration);
const formatName = `FFVideoFormat${height}p${Math.round(fps)}`;

const fcpxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.11">
    <resources>
        <format id="r1" name="${formatName}" frameDuration="${toFcpTime(1 / fps)}" width="${width}" height="${height}"/>
${footageAssets.join('\n')}
${audioAsset}
${titleEffect}
    </resources>
    <library>
        <event name="Video Factory">
            <project name="${outputParsed.name}">
                <sequence format="r1" duration="${totalDur}" tcStart="0s" tcFormat="NDF">
                    <spine>
${videoClips}
${subtitleXml}
                    </spine>
                    <spine lane="-1">
${audioOnTimeline}
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

writeFileSync(outputFile, fcpxml);

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('═══════════════════════════════════════════════');
console.log('✅ Проект собран!');
console.log('');
console.log(`   📄 FCPXML:    ${outputFile}`);
if (enableSubs) {
  console.log(`   📝 SRT:       ${srtFile}`);
}
console.log(`   🎬 Клипов:    ${assignments.length}`);
console.log(`   🎤 Аудио:     ${audioDuration.toFixed(1)}s`);
if (enableSubs) {
  console.log(`   💬 Субтитров: ${subtitleSegments.length}`);
}
console.log(`   📐 Формат:    ${width}x${height} @ ${fps}fps`);
console.log('');
console.log('   Импортируй в Final Cut Pro: File → Import → XML...');
console.log('');
