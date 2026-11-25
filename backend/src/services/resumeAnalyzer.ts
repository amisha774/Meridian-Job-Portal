import zlib from 'node:zlib';
import { IResumeAnalysis } from '../models/User.ts';

const SKILL_DICTIONARY = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Python',
  'Django',
  'Next.js',
  'Tailwind CSS',
  'GraphQL',
  'REST API',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'CI/CD',
  'Git',
  'Redux',
  'SQL',
  'Redis',
  'Figma',
  'UI/UX',
  'Product Strategy',
  'Agile',
  'Scrum',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'Data Analysis',
  'Java',
  'Spring Boot',
  'Go',
  'Rust',
  'Testing',
  'Jest',
  'Cypress',
  'Socket.IO',
  'Microservices',
  'System Design',
  'Leadership',
];

function extractReadableTextFromPdfBuffer(buffer: Buffer): string {
  const rawLatin = buffer.toString('latin1');
  const chunks: string[] = [];

  // Extract FlateDecode streams if present
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(rawLatin)) !== null) {
    const streamData = Buffer.from(match[1], 'latin1');
    try {
      const inflated = zlib.inflateSync(streamData).toString('utf8');
      chunks.push(inflated);
    } catch {
      chunks.push(match[1]);
    }
  }

  const combined = chunks.length > 0 ? chunks.join(' ') : rawLatin;

  // Extract literal PDF text strings inside parentheses ( ... )
  const textRuns: string[] = [];
  const parenRegex = /\(([^()\\]{2,200})\)/g;
  let tMatch: RegExpExecArray | null;
  while ((tMatch = parenRegex.exec(combined)) !== null) {
    const cleaned = tMatch[1].replace(/[^\x20-\x7E]/g, ' ').trim();
    if (cleaned.length > 1) {
      textRuns.push(cleaned);
    }
  }

  const extracted = textRuns.join(' ');
  if (extracted.trim().length > 20) {
    return extracted;
  }

  // Fallback ASCII scan for plain/uncompressed PDFs
  return rawLatin.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ');
}

export function analyzeResumeBuffer(
  buffer: Buffer,
  profileSkills: string[] = []
): IResumeAnalysis {
  const text = extractReadableTextFromPdfBuffer(buffer);
  const lower = text.toLowerCase();

  const words = text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && /[a-zA-Z]/.test(w));

  const detectedSkills = SKILL_DICTIONARY.filter((skill) => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    return regex.test(lower);
  });

  // Merge any profile skills mentioned directly
  for (const s of profileSkills) {
    if (
      s &&
      lower.includes(s.toLowerCase()) &&
      !detectedSkills.some((d) => d.toLowerCase() === s.toLowerCase())
    ) {
      detectedSkills.push(s);
    }
  }

  const sectionsFound: string[] = [];
  if (/(experience|employment|work history|career)/i.test(lower)) sectionsFound.push('Experience');
  if (/(education|university|bachelor|master|degree|b\.s\.|m\.s\.)/i.test(lower))
    sectionsFound.push('Education');
  if (/(skills|technologies|competencies|tech stack)/i.test(lower)) sectionsFound.push('Skills');
  if (/(projects|portfolio|open source)/i.test(lower)) sectionsFound.push('Projects');
  if (/(summary|objective|profile|about)/i.test(lower)) sectionsFound.push('Summary');
  if (/(@|linkedin|github|phone|\+\d)/i.test(lower)) sectionsFound.push('Contact Info');

  let score = 35;
  score += Math.min(25, detectedSkills.length * 4);
  score += Math.min(25, sectionsFound.length * 5);
  if (words.length >= 150) score += 10;
  else if (words.length >= 60) score += 5;
  if (/\d+%|\$\d+|\d+\+/.test(text)) score += 5; // quantified impact
  score = Math.min(98, Math.max(40, score));

  const suggestions: string[] = [];
  if (!sectionsFound.includes('Summary')) {
    suggestions.push('Add a concise 2-3 sentence professional summary at the top of your resume.');
  }
  if (!sectionsFound.includes('Projects')) {
    suggestions.push('Include 2-3 flagship projects with concrete architecture or product outcomes.');
  }
  if (!/\d+%|\$\d+|\d+\+/.test(text)) {
    suggestions.push('Quantify achievements with metrics (e.g., latency reduction %, revenue impact).');
  }
  if (detectedSkills.length < 5) {
    suggestions.push('List core technical tools and frameworks explicitly in a dedicated Skills section.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Strong structure and keyword coverage. Tailor top summary keywords to each target role.');
  }

  return {
    score,
    detectedSkills,
    sectionsFound,
    wordCount: words.length,
    suggestions,
    analyzedAt: new Date(),
  };
}
