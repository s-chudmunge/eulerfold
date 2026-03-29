import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../content/previous_year_papers_pdf');
const outputFile = path.join(__dirname, '../frontend/src/app/(public)/archive/generatedArchiveData.ts');
const mappingFile = path.join(__dirname, '../content/archive_drive_mapping.json');

// Load drive mapping if it exists
let driveMapping = {};
if (fs.existsSync(mappingFile)) {
    try {
        driveMapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (e) {
        console.error('Error parsing drive mapping file:', e);
    }
}

const GATE_SUBJECTS = {
    'AE': 'Aerospace Engineering',
    'AG': 'Agricultural Engineering',
    'AR': 'Architecture and Planning',
    'BM': 'Biomedical Engineering',
    'BT': 'Biotechnology',
    'CE': 'Civil Engineering',
    'CH': 'Chemical Engineering',
    'CS': 'Computer Science and Information Technology',
    'CY': 'Chemistry',
    'DA': 'Data Science and Artificial Intelligence',
    'EC': 'Electronics and Communication Engineering',
    'EE': 'Electrical Engineering',
    'ES': 'Environmental Science and Engineering',
    'EY': 'Ecology and Evolution',
    'GE': 'Geomatics Engineering',
    'GG': 'Geology and Geophysics',
    'IN': 'Instrumentation Engineering',
    'MA': 'Mathematics',
    'ME': 'Mechanical Engineering',
    'MN': 'Mining Engineering',
    'MT': 'Metallurgical Engineering',
    'NM': 'Naval Architecture and Marine Engineering',
    'PE': 'Petroleum Engineering',
    'PH': 'Physics',
    'PI': 'Production and Industrial Engineering',
    'ST': 'Statistics',
    'TF': 'Textile Engineering and Fibre Science',
    'XE': 'Engineering Sciences',
    'XH': 'Humanities and Social Sciences',
    'XL': 'Life Sciences'
};

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');   // Replace multiple - with single -
}

function parseFilename(filename, examType) {
    const name = filename.replace('.pdf', '');
    const decodedName = decodeURIComponent(name);
    
    // Strip long hex strings (usually 24 chars) early
    const nameWithoutHex = decodedName.replace(/[0-9a-f]{24,}/gi, '').replace(/[_\-\s]+/g, ' ');

    // Better Year Extraction
    let year = 'Unknown';
    // Look for 4 digits that are NOT surrounded by other digits
    const yearMatches = [...nameWithoutHex.matchAll(/(?:^|[^0-9])(19\d{2}|20\d{2})(?:$|[^0-9])/g)].map(m => m[1]);
    
    if (yearMatches && yearMatches.length > 0) {
        // If multiple years, pick the one that isn't obviously wrong (like 2095 in some IChO files)
        const validYears = yearMatches.filter(y => parseInt(y) <= new Date().getFullYear() + 1);
        year = validYears.length > 0 ? validYears[validYears.length - 1] : yearMatches[0];
    }

    const lowerName = decodedName.toLowerCase();
    
    // Answer Key detection
    let isAnswerKey = lowerName.includes('answerkey') || 
                     lowerName.includes('answer key') || 
                     lowerName.includes('_sg') || 
                     lowerName.includes('scoring guidelines') ||
                     (lowerName.includes('solution') && !lowerName.includes('problem'));
    
    // Some Putnam files have 'problemSolutions' which are actually problems
    if (examType === 'Putnam' && lowerName.includes('problemsolutions')) {
        isAnswerKey = false;
    }
    // If it's explicitly 'solutionsolutions', it's definitely an answer key
    if (examType === 'Putnam' && lowerName.includes('solutionsolutions')) {
        isAnswerKey = true;
    }

    let subject = '';
    let session = null;
    const parts = name.split('_');

    if (examType === 'GATE') {
        let code = parts[2] || '';
        if (isAnswerKey) {
            code = code.replace(/F$/, ''); // Remove 'F' suffix from Answer Keys
        }
        
        // Check if code has session suffix like CE1, CS2
        const codeMatch = code.match(/^([A-Z]{2,3})(\d)$/);
        if (codeMatch) {
            const baseCode = codeMatch[1];
            session = codeMatch[2];
            subject = GATE_SUBJECTS[baseCode] || baseCode;
        } else {
            subject = GATE_SUBJECTS[code] || code;
        }

        // Also check for explicit Session_X in filename
        if (name.includes('Session')) {
            const sessionMatch = name.match(/Session_(\d+)/);
            if (sessionMatch) {
                session = sessionMatch[1];
            }
        }
    } else {
        // For Olympiads and others, clean up the name
        let cleanSubject = nameWithoutHex
            .replace(new RegExp(examType, 'gi'), '') // Remove Exam Name (exact match)
            .replace(new RegExp(examType.replace(/_/g, ' '), 'gi'), '') // Remove Exam Name with spaces instead of underscores
            .replace(/\b(19\d{2}|20\d{2})\b/g, '')   // Remove all years from subject
            .replace(/[_\-\s]+/g, ' ');               // Normalize spaces/separators

        if (examType === 'IChO') {
            // Specific cleaning for IChO to keep important keywords
            cleanSubject = cleanSubject
                .replace(/UAE/gi, '')
                .replace(/Official English/gi, 'Official')
                .replace(/problemSolutions/gi, 'Problems')
                .replace(/Solutionsolutions/gi, 'Solutions')
                .replace(/Solutions to Prep Problems/gi, 'Prep Solutions')
                .replace(/Theoretical and Practical/gi, 'Theory and Practical')
                .replace(/Theoretical/gi, 'Theory')
                .replace(/PracticalExam/gi, 'Practical Exam')
                .replace(/Practical/gi, 'Practical')
                .replace(/Theory/gi, 'Theory')
                .replace(/Exam/gi, 'Exam')
                .replace(/Prep/gi, 'Prep')
                .replace(/Preparatory/gi, 'Prep')
                .replace(/v\d+(\s+\(\d+\))?/gi, '') // Remove version numbers like v24 (1)
                .replace(/April 14th|June 10th/gi, '') // Remove dates
                .replace(/w sol ultimate/gi, '')
                .replace(/\d{4}/g, '') // Extra safety: remove any remaining 4-digit numbers
                .replace(/\s+/g, ' ')
                .trim();
        } else {
            cleanSubject = cleanSubject
                .replace(/problemSolutions|Solutionsolutions|AnswerKey|Answer Key|Question Paper|Problems|Theoretical|Practical|Solutions|Solution|QP|SG|UAE| UAE|UAE /gi, '')
                .replace(/\s+/g, ' ')
                .trim();
        }
        
        // Final cleaning of leading/trailing punctuation
        subject = cleanSubject.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
        
        // Standardize for common exams that are usually just one paper
        if (!subject || subject.toLowerCase() === 'main' || subject.toLowerCase() === 'paper') {
            subject = 'Main Paper';
        }

        if (name.includes('Session')) {
            const sessionMatch = name.match(/Session_(\d+)/);
            if (sessionMatch) {
                session = sessionMatch[1];
            }
        }
    }

    return {
        filename,
        year,
        subject,
        session,
        isAnswerKey,
        examType,
        slug: slugify(`${examType} ${subject} ${year} ${session ? 'S' + session : ''}`)
    };
}

async function compile() {
    if (!fs.existsSync(sourceDir)) {
        console.warn('Source directory not found:', sourceDir);
        return;
    }
    const exams = fs.readdirSync(sourceDir).filter(f => fs.statSync(path.join(sourceDir, f)).isDirectory());
    const archiveData = [];

    for (const exam of exams) {
        const examPath = path.join(sourceDir, exam);
        const files = fs.readdirSync(examPath).filter(f => f.endsWith('.pdf'));
        
        const groups = {}; 
        
        for (const file of files) {
            const parsed = parseFilename(file, exam);
            // Use subject + year + session as part of key to group QP/AK
            const key = `${parsed.year}_${parsed.subject.toLowerCase()}_${parsed.session || ''}`;
            
            if (!groups[key]) {
                groups[key] = {
                    year: parsed.year,
                    subject: parsed.subject,
                    session: parsed.session,
                    examType: exam,
                    questionPaper: null,
                    answerKey: null,
                    questionPaperDriveId: null,
                    answerKeyDriveId: null,
                    slug: parsed.slug
                };
            }
            
            const driveId = driveMapping[file] || null;

            if (parsed.isAnswerKey) {
                groups[key].answerKey = file;
                groups[key].answerKeyDriveId = driveId;
            } else {
                groups[key].questionPaper = file;
                groups[key].questionPaperDriveId = driveId;
            }
        }

        // --- SECOND PASS: Group session-less Answer Keys with sessioned Question Papers (primarily for GATE) ---
        const entryKeys = Object.keys(groups);
        for (const key of entryKeys) {
            const entry = groups[key];
            if (!entry) continue; // Safety check

            if (entry.examType === 'GATE' && entry.answerKey && !entry.questionPaper && entry.session === null) {
                // This is a session-less Answer Key. Find papers for the same year and subject.
                const matchingPaperKeys = entryKeys.filter(k => {
                    const e = groups[k];
                    return e && 
                           e.year === entry.year && 
                           e.subject === entry.subject && 
                           e.questionPaper && 
                           e.session !== null;
                });

                if (matchingPaperKeys.length > 0) {
                    // Attach this answer key to all matching sessioned papers
                    for (const pk of matchingPaperKeys) {
                        if (!groups[pk].answerKey) {
                            groups[pk].answerKey = entry.answerKey;
                            groups[pk].answerKeyDriveId = entry.answerKeyDriveId;
                        }
                    }
                    // Remove the session-less entry
                    delete groups[key];
                }
            }
        }
        
        const sortedEntries = Object.values(groups).sort((a, b) => {
            if (b.year !== a.year) return b.year.localeCompare(a.year);
            return a.subject.localeCompare(b.subject);
        });
        
        archiveData.push({
            id: exam,
            title: exam,
            entries: sortedEntries
        });
    }

    // Sort categories by ID
    archiveData.sort((a, b) => a.id.localeCompare(b.id));

    const tsOutput = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
export interface PaperEntry {
  year: string;
  subject: string;
  session: string | null;
  examType: string;
  questionPaper: string | null;
  answerKey: string | null;
  questionPaperDriveId: string | null;
  answerKeyDriveId: string | null;
  slug: string;
}

export interface ExamCategory {
  id: string;
  title: string;
  entries: PaperEntry[];
}

export const archiveData: ExamCategory[] = ${JSON.stringify(archiveData, null, 2)};
`;

    if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }
    fs.writeFileSync(outputFile, tsOutput, 'utf8');
}

compile();
