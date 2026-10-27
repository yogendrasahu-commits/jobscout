// AI Resume & Job Fit Match Engine for JobScout Backend
// Comprehensive skill taxonomy, semantic fuzzy matching, and resume parser.

export const SKILL_TAXONOMY = {
  // Frontend
  react: ['react', 'react.js', 'reactjs', 'react native', 'jsx', 'tsx'],
  nextjs: ['next.js', 'nextjs', 'next'],
  vue: ['vue', 'vue.js', 'vuejs', 'nuxt'],
  angular: ['angular', 'angularjs', 'typescript'],
  javascript: ['javascript', 'js', 'es6', 'es2020', 'vanilla js'],
  typescript: ['typescript', 'ts'],
  html_css: ['html', 'html5', 'css', 'css3', 'scss', 'sass', 'tailwind', 'tailwind css', 'bootstrap'],
  webrtc: ['webrtc', 'p2p', 'mediastream', 'audio/video call', 'rtcpeerconnection'],
  socketio: ['socket.io', 'socketio', 'websockets', 'socket'],

  // Backend
  nodejs: ['node.js', 'nodejs', 'node', 'express', 'express.js', 'nestjs', 'fastify'],
  python: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
  java: ['java', 'spring', 'spring boot', 'hibernate'],
  golang: ['go', 'golang', 'gin'],
  csharp: ['c#', '.net', 'asp.net', 'dotnet'],
  php: ['php', 'laravel', 'wordpress'],

  // Databases & Caches
  sql: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle'],
  nosql: ['mongodb', 'mongo', 'dynamodb', 'couchbase'],
  redis: ['redis', 'caching', 'memcached', 'key-value'],

  // Cloud & DevOps
  aws: ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'cloudfront', 'rds'],
  docker: ['docker', 'containers', 'dockerfile', 'docker-compose'],
  kubernetes: ['kubernetes', 'k8s', 'helm', 'cluster'],
  cicd: ['ci/cd', 'github actions', 'jenkins', 'gitlab ci', 'pipeline', 'devops'],
  terraform: ['terraform', 'iac', 'infrastructure as code'],

  // Design & Product
  figma: ['figma', 'ui/ux', 'ui design', 'ux design', 'prototyping', 'wireframing', 'design systems', 'user research'],
  photoshop: ['photoshop', 'illustrator', 'adobe xd', 'graphic design'],

  // Testing & QA
  testing: ['jest', 'cypress', 'playwright', 'selenium', 'unit testing', 'automation', 'qa', 'test automation'],

  // Non-tech / Operations
  delivery: ['delivery', 'route navigation', 'two wheeler', 'bike driving', 'dispatch', 'courier', 'logistics'],
  warehouse: ['warehouse management', 'inventory erp', 'inventory', 'stocking', 'supply chain', 'team leadership'],
  support: ['customer support', 'customer handling', 'pos billing', 'telecalling', 'patient care', 'tele-sales', 'communication'],
  networking: ['networking', 'hardware troubleshooting', 'os setup', 'lan/wan', 'tcp/ip', 'router config']
};

export function normalizeSkill(raw) {
  if (!raw) return '';
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[#\-_.]/g, '')
    .replace(/\s+/g, '');
}

export function isSkillMatch(candidateSkill, jobSkill) {
  const normCand = normalizeSkill(candidateSkill);
  const normJob = normalizeSkill(jobSkill);

  if (normCand === normJob) return true;
  if (normCand.includes(normJob) || normJob.includes(normCand)) return true;

  for (const family of Object.values(SKILL_TAXONOMY)) {
    const hasCand = family.some(f => normalizeSkill(f) === normCand || normCand.includes(normalizeSkill(f)));
    const hasJob = family.some(f => normalizeSkill(f) === normJob || normJob.includes(normalizeSkill(f)));
    if (hasCand && hasJob) return true;
  }

  return false;
}

export function calculateAIMatch(candidate, job) {
  if (!candidate || !job) {
    return {
      score: 65,
      tier: 'good',
      label: '65% Match',
      matchedSkills: [],
      missingSkills: [],
      recommendations: ['Update your profile skills to get a deeper AI match analysis.'],
      summary: 'Standard match based on available profile information.'
    };
  }

  const candidateSkills = Array.isArray(candidate.skills) ? candidate.skills : [];
  const jobSkills = Array.isArray(job.skills) ? job.skills : [];

  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach(reqSkill => {
    const matched = candidateSkills.find(cSkill => isSkillMatch(cSkill, reqSkill));
    if (matched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  let skillPoints = 0;
  if (jobSkills.length > 0) {
    skillPoints = (matchedSkills.length / jobSkills.length) * 55;
  } else {
    skillPoints = 45;
  }

  let titlePoints = 10;
  const candTitle = String(candidate.title || '').toLowerCase();
  const candBio = String(candidate.bio || '').toLowerCase();
  const jobTitle = String(job.title || '').toLowerCase();

  const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 3);
  const matchingWords = titleWords.filter(w => candTitle.includes(w) || candBio.includes(w));
  if (titleWords.length > 0) {
    titlePoints = Math.round((matchingWords.length / titleWords.length) * 20);
  }

  let expPoints = 12;
  const candExp = String(candidate.experience || '').toLowerCase();
  const isSeniorJob = jobTitle.includes('senior') || jobTitle.includes('lead') || jobTitle.includes('principal');
  const isJuniorJob = jobTitle.includes('junior') || jobTitle.includes('fresher') || jobTitle.includes('intern');

  if (isSeniorJob) {
    if (candExp.includes('5+') || candExp.includes('3 - 5') || candExp.includes('senior')) {
      expPoints = 15;
    } else if (candExp.includes('fresher')) {
      expPoints = 5;
    }
  } else if (isJuniorJob) {
    if (candExp.includes('fresher') || candExp.includes('1 - 3')) {
      expPoints = 15;
    }
  }

  let locPoints = 8;
  const candCity = String(candidate.address || '').toLowerCase();
  const jobAddress = String(job.address || '').toLowerCase();
  if (jobAddress.includes('remote') || candCity.includes('remote')) {
    locPoints = 10;
  } else if (candCity && jobAddress) {
    const mainCity = candCity.split(',')[0].trim().toLowerCase();
    if (mainCity && jobAddress.includes(mainCity)) {
      locPoints = 10;
    }
  }

  let rawScore = Math.round(skillPoints + titlePoints + expPoints + locPoints);
  if (matchedSkills.length > 0) {
    rawScore = Math.max(rawScore, 58);
  }
  const score = Math.min(98, Math.max(35, rawScore));

  let tier = 'developing';
  let badgeColor = 'slate';
  let label = `${score}% Match`;

  if (score >= 82) {
    tier = 'exceptional';
    badgeColor = 'emerald';
    label = `${score}% Strong Fit`;
  } else if (score >= 68) {
    tier = 'strong';
    badgeColor = 'indigo';
    label = `${score}% Good Match`;
  } else if (score >= 50) {
    tier = 'moderate';
    badgeColor = 'amber';
    label = `${score}% Potential Fit`;
  } else {
    tier = 'developing';
    badgeColor = 'slate';
    label = `${score}% Emerging Fit`;
  }

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Add ${missingSkills.slice(0, 2).join(' and ')} to your profile to boost your fit to ${Math.min(98, score + 16)}%.`);
  }
  if (matchedSkills.length > 0) {
    recommendations.push(`Highlight your experience with ${matchedSkills.slice(0, 2).join(' & ')} in your application cover note.`);
  }
  if (score >= 80) {
    recommendations.push('High likelihood of interview request! Apply with 1-click Easy Apply today.');
  }

  let summary = '';
  if (tier === 'exceptional') {
    summary = `Exceptional profile match! Your experience with ${matchedSkills.join(', ')} directly satisfies the job requirements.`;
  } else if (tier === 'strong') {
    summary = `Strong candidacy with core skills aligned (${matchedSkills.join(', ') || 'repertoire'}). Learning ${missingSkills[0] || 'advanced tooling'} will make you a standout candidate.`;
  } else if (tier === 'moderate') {
    summary = `Good foundational profile. Bridging gaps in ${missingSkills.slice(0, 2).join(' & ')} will enhance recruiter shortlisting rate.`;
  } else {
    summary = `Profile partially matches requirements. Consider highlighting transferable skills or tailored project work.`;
  }

  return {
    score,
    tier,
    badgeColor,
    label,
    matchedSkills,
    missingSkills,
    recommendations,
    summary
  };
}

export function extractSkillsFromResume(text) {
  if (!text || typeof text !== 'string') return [];
  const clean = text.toLowerCase();
  const detected = new Set();

  for (const [canonicalName, variations] of Object.entries(SKILL_TAXONOMY)) {
    for (const v of variations) {
      const regex = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(clean)) {
        const display = canonicalName === 'react' ? 'React'
          : canonicalName === 'nodejs' ? 'Node.js'
          : canonicalName === 'javascript' ? 'JavaScript'
          : canonicalName === 'typescript' ? 'TypeScript'
          : canonicalName === 'html_css' ? 'Tailwind CSS'
          : canonicalName === 'webrtc' ? 'WebRTC'
          : canonicalName === 'socketio' ? 'Socket.io'
          : canonicalName === 'figma' ? 'Figma'
          : canonicalName === 'aws' ? 'AWS'
          : canonicalName === 'docker' ? 'Docker'
          : canonicalName === 'kubernetes' ? 'Kubernetes'
          : canonicalName === 'testing' ? 'Jest'
          : canonicalName.charAt(0).toUpperCase() + canonicalName.slice(1);
        detected.add(display);
        break;
      }
    }
  }

  return Array.from(detected);
}
