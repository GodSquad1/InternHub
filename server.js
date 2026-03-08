// ============================================
// InternHub - COMPLETE EXPRESS SERVER
// Resume Analyzer + AI Interview Coach + ElevenLabs TTS
// ============================================

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AdmZip = require('adm-zip');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// API KEYS — replace with env vars in production
// ============================================

const OPENAI_API_KEY = "API"
const ELEVENLABS_API_KEY = "API"

if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
  console.error('\n⚠️  WARNING: OPENAI_API_KEY is not set. Resume analysis and interview features will not work.\n');
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ============================================
// FILE UPLOAD CONFIG
// ============================================

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip'
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type. Only PDF, DOCX, and ZIP allowed.'));
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from DOCX: ' + error.message);
  }
}

function extractCodeFromZIP(buffer) {
  try {
    const zip = new AdmZip(buffer);
    const allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
      '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.sql',
      '.html', '.css', '.scss', '.json', '.xml', '.yaml', '.yml'
    ];
    const codeFiles = [];

    zip.getEntries().forEach(entry => {
      if (!entry.isDirectory) {
        const fileName = entry.entryName;
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        if (allowedExtensions.includes(ext) && entry.getData().length < 1024 * 1024) {
          try {
            codeFiles.push({
              name: fileName,
              extension: ext,
              content: entry.getData().toString('utf8'),
              size: entry.getData().length
            });
          } catch (e) {
            // Skip binary files
          }
        }
      }
    });
    return codeFiles;
  } catch (error) {
    throw new Error('Failed to extract ZIP: ' + error.message);
  }
}

function analyzeCodeFiles(codeFiles) {
  const analysis = {
    totalFiles: codeFiles.length,
    languages: {},
    totalLines: 0,
    complexity: { functions: 0, classes: 0, imports: 0, comments: 0 },
    bestPractices: { hasTests: false, hasDocumentation: false, hasTypeChecking: false, hasLinting: false }
  };

  const langMap = {
    '.js': 'JavaScript', '.jsx': 'JavaScript/React', '.ts': 'TypeScript',
    '.tsx': 'TypeScript/React', '.py': 'Python', '.java': 'Java',
    '.cpp': 'C++', '.c': 'C', '.cs': 'C#', '.go': 'Go', '.rb': 'Ruby',
    '.php': 'PHP', '.swift': 'Swift', '.kt': 'Kotlin', '.rs': 'Rust',
    '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS'
  };

  codeFiles.forEach(file => {
    const lines = file.content.split('\n');
    analysis.totalLines += lines.length;
    const lang = langMap[file.extension] || 'Other';
    analysis.languages[lang] = (analysis.languages[lang] || 0) + 1;
    const c = file.content;
    analysis.complexity.functions += (c.match(/function\s+\w+|def\s+\w+|func\s+\w+/g) || []).length;
    analysis.complexity.classes += (c.match(/class\s+\w+/g) || []).length;
    analysis.complexity.imports += (c.match(/import\s+|from\s+.*import|require\(|#include/g) || []).length;
    analysis.complexity.comments += (c.match(/\/\/|\/\*|\*\/|#|<!--/g) || []).length;
    if (file.name.includes('test') || file.name.includes('spec')) analysis.bestPractices.hasTests = true;
    if (file.name.includes('README') || file.extension === '.md') analysis.bestPractices.hasDocumentation = true;
    if (['.ts', '.tsx'].includes(file.extension)) analysis.bestPractices.hasTypeChecking = true;
    if (file.name.includes('eslint') || file.name.includes('prettier')) analysis.bestPractices.hasLinting = true;
  });

  return analysis;
}

async function analyzeWithOpenAI(resumeText, codeAnalysis, codeFiles) {
  const prompt = `
You are an expert career advisor analyzing a candidate's resume and coding projects for internship readiness.

RESUME CONTENT:
${resumeText.substring(0, 3000)}${resumeText.length > 3000 ? '...(truncated)' : ''}

CODE PROJECT ANALYSIS:
- Total Files: ${codeAnalysis.totalFiles}
- Total Lines of Code: ${codeAnalysis.totalLines}
- Languages Used: ${Object.keys(codeAnalysis.languages).join(', ')}
- Functions/Methods: ${codeAnalysis.complexity.functions}
- Classes: ${codeAnalysis.complexity.classes}
- Has Tests: ${codeAnalysis.bestPractices.hasTests}
- Has Documentation: ${codeAnalysis.bestPractices.hasDocumentation}
- Uses TypeScript: ${codeAnalysis.bestPractices.hasTypeChecking}

CODE SAMPLES (First 3 files):
${codeFiles.slice(0, 3).map(f => `FILE: ${f.name}\n${f.content.substring(0, 500)}...\n`).join('\n---\n')}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "overallScore": <0-100>,
  "scoreBreakdown": {
    "technicalSkills": <0-100>,
    "codeQuality": <0-100>,
    "projectComplexity": <0-100>,
    "resumeQuality": <0-100>,
    "marketReadiness": <0-100>
  },
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>", "<strength 5>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>", "<improvement 5>"],
  "detectedSkills": {
    "technical": [{"name": "JavaScript", "level": "Intermediate", "confidence": 85}],
    "soft": ["Problem Solving", "Team Collaboration"]
  },
  "skillGaps": [{"skill": "Testing", "importance": "High", "reason": "No test files found"}],
  "recommendedSkills": [{"name": "TypeScript", "priority": "High", "estimatedTime": "2-3 weeks", "reason": "Will improve code quality"}],
  "codeQualityInsights": {
    "positives": ["Good code organization"],
    "concerns": ["Lack of comments"],
    "suggestions": ["Add unit tests"]
  },
  "resumeInsights": {
    "formatting": "Well structured",
    "content": "Good technical skills",
    "suggestions": ["Add metrics to achievements"]
  },
  "careerReadiness": {
    "internshipReady": true,
    "targetRoles": ["Frontend Developer", "Full Stack Developer"],
    "estimatedPreparationTime": "2-4 weeks",
    "nextSteps": ["Build portfolio", "Practice interviews"]
  }
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You are an expert career advisor and technical recruiter. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content);
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'InternHub API Server is running',
    openaiConfigured: !!(OPENAI_API_KEY && OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY_HERE"),
    elevenlabsConfigured: !!(ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== "YOUR_ELEVENLABS_API_KEY_HERE"),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// RESUME ANALYZER ENDPOINT
// ============================================

app.post('/api/analyze',
  upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'code', maxCount: 1 }]),
  async (req, res) => {
    console.log('\n=== RESUME ANALYSIS REQUEST ===', new Date().toISOString());
    try {
      if (!req.files?.resume || !req.files?.code) {
        return res.status(400).json({ error: 'Both resume and code files are required' });
      }

      const resumeFile = req.files.resume[0];
      const codeFile = req.files.code[0];

      // Extract resume text
      let resumeText;
      if (resumeFile.mimetype === 'application/pdf') {
        resumeText = await extractTextFromPDF(resumeFile.buffer);
      } else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        resumeText = await extractTextFromDOCX(resumeFile.buffer);
      } else {
        return res.status(400).json({ error: 'Resume must be PDF or DOCX' });
      }

      if (!resumeText || resumeText.trim().length < 50) {
        return res.status(400).json({ error: 'Resume text too short or extraction failed' });
      }

      // Extract code files
      if (codeFile.mimetype !== 'application/zip') {
        return res.status(400).json({ error: 'Code file must be a ZIP archive' });
      }
      const codeFiles = extractCodeFromZIP(codeFile.buffer);
      if (codeFiles.length === 0) {
        return res.status(400).json({ error: 'No valid code files found in ZIP' });
      }

      const codeAnalysis = analyzeCodeFiles(codeFiles);
      const aiAnalysis = await analyzeWithOpenAI(resumeText, codeAnalysis, codeFiles);

      res.json({
        success: true,
        analysis: {
          ...aiAnalysis,
          metadata: {
            resumeFileName: resumeFile.originalname,
            codeFileName: codeFile.originalname,
            analyzedAt: new Date().toISOString(),
            codeStats: {
              totalFiles: codeAnalysis.totalFiles,
              totalLines: codeAnalysis.totalLines,
              languages: codeAnalysis.languages
            }
          }
        }
      });
    } catch (error) {
      console.error('Analysis error:', error.message);
      res.status(500).json({ error: 'Analysis failed', message: error.message });
    }
  }
);

// ============================================
// AI INTERVIEW COACH — GENERATE QUESTION
// ============================================

app.post('/api/interview/question', async (req, res) => {
  try {
    const { field, experienceLevel, focus, company, context, conversationHistory, currentDepth, isIntroduction } = req.body;

    let prompt;
    if (isIntroduction) {
      prompt = `You are an expert technical interviewer conducting a ${experienceLevel} level interview for a ${field} position${company ? ` at ${company}` : ''}.

Focus style: ${focus || 'balanced'}

Generate a natural, conversational introduction (2-3 sentences) welcoming the candidate and asking your first specific question. The question should be:
- Highly relevant to ${field}
- Appropriate for ${experienceLevel} level  
- ${focus === 'technical_deep' ? 'Deep technical — test real implementation knowledge' : focus === 'behavioral' ? 'Behavioral — use STAR format prompts' : focus === 'system_design' ? 'System design — ask about architecture' : 'Balanced mix of technical and behavioral'}
- Specific, not generic

Format: Just the spoken text, no labels.`;
    } else {
      const lastExchange = (conversationHistory || []).slice(-4);
      prompt = `You are conducting an adaptive ${field} interview (${experienceLevel} level)${company ? ` at ${company}` : ''}.

Recent conversation:
${lastExchange.map(e => `${e.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${e.content}`).join('\n')}

Current depth: ${currentDepth || 1}/3

Based on their last answer, do ONE of:
1. Ask a deeper follow-up if they gave a strong answer
2. Ask for clarification if their answer was vague or incomplete  
3. Pivot to a new relevant topic if depth limit reached

Rules:
- Be direct and conversational
- Reference specific things they said
- Keep it to 1-2 sentences max
- Do NOT repeat previous questions

Respond with just the question text.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a strict but fair technical interviewer. Ask one focused question at a time. Be concise." },
        { role: "user", content: prompt }
      ],
      temperature: 0.75,
      max_tokens: 200
    });

    res.json({ success: true, question: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Interview question error:', error.message);
    res.status(500).json({ error: 'Failed to generate question', message: error.message });
  }
});

// ============================================
// AI INTERVIEW COACH — ANALYZE ANSWER
// ============================================

app.post('/api/interview/analyze', async (req, res) => {
  try {
    const { answer, field, experienceLevel } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `Analyze this ${field} interview answer:
"${answer}"

Extract in this exact format:
Topics: X, Y, Z | Depth: N | Action: deeper/switch

Where:
- Topics: main technical topics mentioned (2-4 max)
- Depth: 1=basic, 2=intermediate, 3=expert
- Action: "deeper" if they showed good knowledge, "switch" to move on`
      }],
      max_tokens: 120
    });

    const analysis = completion.choices[0].message.content;
    const topicsMatch = analysis.match(/Topics:\s*(.*?)(?:\s*\|)/);
    const depthMatch = analysis.match(/Depth:\s*(\d)/);
    const actionMatch = analysis.match(/Action:\s*(\w+)/);

    res.json({
      success: true,
      analysis: {
        topics: topicsMatch ? topicsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [],
        depth: depthMatch ? parseInt(depthMatch[1]) : 1,
        action: actionMatch ? actionMatch[1] : 'switch'
      }
    });
  } catch (error) {
    console.error('Answer analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze answer' });
  }
});

// ============================================
// AI INTERVIEW COACH — GENERATE FEEDBACK
// ============================================

app.post('/api/interview/feedback', async (req, res) => {
  try {
    const { conversationHistory, field, experienceLevel, company } = req.body;

    if (!conversationHistory || conversationHistory.length < 2) {
      return res.json({ success: true, feedback: "Interview was too short for detailed feedback. Try completing at least 3-4 questions for a full assessment." });
    }

    const conversationText = conversationHistory
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are an expert interview coach. Provide honest, specific, actionable feedback." },
        {
          role: "user",
          content: `Analyze this ${field} interview for a ${experienceLevel} candidate${company ? ` interviewing at ${company}` : ''}:

${conversationText}

Provide comprehensive feedback with these sections:

## Overall Performance Rating
Give a rating out of 10 with a brief explanation.

## Key Strengths
List 3-4 specific things they did well with examples from the interview.

## Areas for Improvement
List 3-4 specific, actionable improvements with concrete suggestions.

## Technical Assessment
How was their technical depth and accuracy?

## Communication
How clear and structured were their answers?

## Actionable Next Steps
3 concrete things to practice before the real interview.

${company ? `## ${company}-Specific Tips\nCustom advice for this company's interview style.` : ''}

Be honest but encouraging. Use specific examples from the conversation.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1800
    });

    res.json({ success: true, feedback: completion.choices[0].message.content });
  } catch (error) {
    console.error('Feedback error:', error.message);
    res.status(500).json({ error: 'Failed to generate feedback', message: error.message });
  }
});

// ============================================
// AI INTERVIEW COACH — HINT
// ============================================

app.post('/api/interview/hint', async (req, res) => {
  try {
    const { question, field, experienceLevel } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `For this ${field} interview question: "${question}"

Give a brief, helpful hint (NOT the full answer) for a ${experienceLevel} candidate. 1-2 sentences only. Focus on the approach/framework to use.`
      }],
      max_tokens: 100
    });

    res.json({ success: true, hint: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Hint error:', error.message);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// ============================================
// ELEVENLABS TEXT-TO-SPEECH PROXY
// Keeps the ElevenLabs API key secure on the server
// ============================================

app.post('/api/interview/speak', async (req, res) => {
  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Text and voiceId are required' });
  }

  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "YOUR_ELEVENLABS_API_KEY_HERE") {
    return res.status(503).json({ error: 'ElevenLabs API key not configured' });
  }

  try {
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    console.log('TTS request for voice:', voiceId, '| text length:', text.length);

    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text.substring(0, 2500), // Limit to 500 chars for speed
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.80,
          style: 0.25
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error:', response.status, errorText);
      return res.status(502).json({
        error: 'ElevenLabs API error',
        status: response.status,
        details: errorText
      });
    }

    // Stream audio back to client
    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioBuffer.byteLength);
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS proxy error:', error.message);
    res.status(500).json({ error: 'Text-to-speech failed', message: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ error: 'Internal server error', message: error.message });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  InternHub API Server');
  console.log('========================================');
  console.log(`  Port:        ${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/api/health`);
  console.log(`  OpenAI:      ${OPENAI_API_KEY && OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY_HERE" ? '✓ Configured' : '✗ NOT CONFIGURED'}`);
  console.log(`  ElevenLabs:  ${ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== "YOUR_ELEVENLABS_API_KEY_HERE" ? '✓ Configured' : '✗ NOT CONFIGURED'}`);
  console.log('========================================\n');
});

module.exports = app;

