#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, mkdtempSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join, parse, resolve } from 'path';

// --- Parse args ---
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
auto-subs — автосубтитры для Final Cut Pro + SRT

Использование:
  auto-subs input.mp4 [опции]

Опции:
  -o, --output <path>   Имя выходного файла (без расширения, создаст .fcpxml и .srt)
  --font <name>         Шрифт (default: "Arial Bold")
  --size <n>            Размер (default: 72)
  --color <hex>         Цвет текста (default: "#FFFFFF")
  --stroke <hex>        Обводка (default: "#000000")
  --position <pos>      top/center/bottom (default: bottom)
  --mode <mode>         words/phrases (default: phrases)
  --lang <code>         Язык Whisper (default: ru)
  --model <name>        Модель Whisper (default: small)
  --max-words <n>       Макс слов в фразе (default: 8)
`);
  process.exit(0);
}

function getArg(flag, def) {
  const i = args.indexOf(flag);
  if (i === -1) {
    const alt = flag.replace(/^--/, '-');
    const j = args.indexOf(alt);
    return j !== -1 && args[j + 1] ? args[j + 1] : def;
  }
  return args[i + 1] || def;
}

const inputFile = args.find(a => !a.startsWith('-'));
if (!inputFile) { console.error('Ошибка: укажи входной файл'); process.exit(1); }

const inputPath = resolve(inputFile);
const parsed = parse(inputPath);
const outputBase = getArg('--output', getArg('-o', join(parsed.dir, parsed.name)));

const font = getArg('--font', 'Arial Bold');
const fontSize = parseInt(getArg('--size', '72'));
const color = getArg('--color', '#FFFFFF');
const stroke = getArg('--stroke', '#000000');
const position = getArg('--position', 'bottom');
const mode = getArg('--mode', 'phrases');
const lang = getArg('--lang', 'ru');
const whisperModel = getArg('--model', 'small');
const maxWords = parseInt(getArg('--max-words', '8'));

// --- Get video info ---
console.log('📹 Анализ видео...');
const probeJson = execSync(`ffprobe -v quiet -print_format json -show_streams -show_format "${inputPath}"`, { encoding: 'utf8' });
const probe = JSON.parse(probeJson);
const videoStream = probe.streams.find(s => s.codec_type === 'video');
const width = videoStream ? parseInt(videoStream.width) : 1920;
const height = videoStream ? parseInt(videoStream.height) : 1080;
const duration = parseFloat(probe.format.duration);

// Parse framerate
let fps = 30;
if (videoStream && videoStream.r_frame_rate) {
  const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
  fps = den ? num / den : num;
}
// Round to common rates
const commonRates = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];
fps = commonRates.reduce((prev, curr) => Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev);

console.log(`   ${width}x${height}, ${fps}fps, ${duration.toFixed(1)}s`);

// --- Whisper transcription ---
console.log('🎤 Транскрипция через Whisper...');
const tmpDir = mkdtempSync(join(tmpdir(), 'autosubs-'));
const whisperOut = join(tmpDir, 'transcript');

execSync(
  `whisper "${inputPath}" --model ${whisperModel} --language ${lang} --output_format json --output_dir "${tmpDir}" --word_timestamps True`,
  { stdio: 'inherit' }
);

// Find the json output
const jsonFile = join(tmpDir, parsed.name + '.json');
const whisperData = JSON.parse(readFileSync(jsonFile, 'utf8'));

// --- Build segments ---
let segments = [];

if (mode === 'words') {
  // Each word = separate subtitle
  for (const seg of whisperData.segments) {
    if (seg.words) {
      for (const w of seg.words) {
        segments.push({ start: w.start, end: w.end, text: w.word.trim() });
      }
    } else {
      segments.push({ start: seg.start, end: seg.end, text: seg.text.trim() });
    }
  }
} else {
  // Phrases: group words up to maxWords
  const allWords = [];
  for (const seg of whisperData.segments) {
    if (seg.words) {
      for (const w of seg.words) {
        allWords.push({ start: w.start, end: w.end, text: w.word.trim() });
      }
    } else {
      allWords.push({ start: seg.start, end: seg.end, text: seg.text.trim() });
    }
  }
  
  for (let i = 0; i < allWords.length; ) {
    const chunk = allWords.slice(i, i + maxWords);
    segments.push({
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
      text: chunk.map(w => w.text).join(' ')
    });
    i += maxWords;
  }
}

console.log(`📝 ${segments.length} субтитров (${mode})`);

// --- Generate SRT ---
function toSrtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.round((sec % 1) * 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
}

let srt = '';
segments.forEach((seg, i) => {
  srt += `${i + 1}\n${toSrtTime(seg.start)} --> ${toSrtTime(seg.end)}\n${seg.text}\n\n`;
});

const srtPath = outputBase + '.srt';
writeFileSync(srtPath, srt);
console.log(`✅ SRT: ${srtPath}`);

// --- Generate FCPXML ---
function toFcpTime(sec) {
  // FCPXML uses rational time: "numerator/denominator s"
  const frames = Math.round(sec * fps);
  return `${frames}/${fps}s`;
}

function hexToFcpColor(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
  return { r: r.toFixed(4), g: g.toFixed(4), b: b.toFixed(4), a: a.toFixed(4) };
}

const textColor = hexToFcpColor(color);
const strokeColor = hexToFcpColor(stroke);

// Position Y offset
const posY = position === 'top' ? '85' : position === 'center' ? '0' : '-85';

const titleClips = segments.map((seg, i) => {
  const offset = toFcpTime(seg.start);
  const dur = toFcpTime(seg.end - seg.start);
  const escaped = seg.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
  return `
                <title ref="r2" offset="${offset}" name="Subtitle ${i + 1}" duration="${dur}" start="${toFcpTime(0)}">
                    <param name="Position" key="9999/999166631/999166633/1/100/101" value="0 ${posY}"/>
                    <param name="Flatten" key="9999/999166631/999166633/2/351" value="1"/>
                    <param name="Alignment" key="9999/999166631/999166633/2/354/999169573/401" value="1 (Center)"/>
                    <text>
                        <text-style ref="ts${i + 1}">${escaped}</text-style>
                    </text>
                    <text-style-def id="ts${i + 1}">
                        <text-style font="${font}" fontSize="${fontSize}" fontFace="Regular" fontColor="${textColor.r} ${textColor.g} ${textColor.b} ${textColor.a}" strokeColor="${strokeColor.r} ${strokeColor.g} ${strokeColor.b} 1" strokeWidth="3" bold="1"/>
                    </text-style-def>
                </title>`;
}).join('\n');

const totalDur = toFcpTime(duration);

const fcpxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.11">
    <resources>
        <format id="r1" name="FFVideoFormat${height === 1080 ? '1080' : height === 2160 ? '2160' : height}p${Math.round(fps)}" frameDuration="${toFcpTime(1 / fps)}" width="${width}" height="${height}"/>
        <effect id="r2" name="Basic Title" uid=".../Titles.localized/Bumper:Opener.localized/Basic Title.localized/Basic Title.moti"/>
    </resources>
    <library>
        <event name="Auto Subs">
            <project name="Subtitles - ${parsed.name}">
                <sequence format="r1" duration="${totalDur}" tcStart="0s" tcFormat="NDF">
                    <spine>
                        <gap name="Gap" offset="0s" duration="${totalDur}" start="0s">
${titleClips}
                        </gap>
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

const fcpxmlPath = outputBase + '.fcpxml';
writeFileSync(fcpxmlPath, fcpxml);
console.log(`✅ FCPXML: ${fcpxmlPath}`);

// Cleanup
try { unlinkSync(jsonFile); } catch {}

console.log(`\n🎬 Готово! Импортируй ${parse(fcpxmlPath).base} в Final Cut Pro.`);
