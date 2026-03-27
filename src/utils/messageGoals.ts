const STAGE_GOALS: Record<string, { goal: string; shortLabel: string }> = {
  'fb pending': {
    goal: "Candidate's CV was shared with client but feedback is pending. Message goal is to give candidate a positive update that their profile is being reviewed and keep them warm and interested. Do NOT mention how many days it has been.",
    shortLabel: 'Keep candidate warm',
  },
  'cv shortlisted': {
    goal: "Candidate's CV is shortlisted. Message goal is to excite the candidate and confirm their interest before scheduling the interview. Ask if they are still actively looking and available for an interview this week.",
    shortLabel: 'Confirm interview interest',
  },
  'process': {
    goal: "Candidate is in interview process (telephonic or video call stage). Message goal is to check if they appeared for the interview and collect feedback. If not appeared, nudge them to reschedule as soon as possible.",
    shortLabel: 'Check interview status',
  },
  'tel': {
    goal: "Candidate is in interview process (telephonic or video call stage). Message goal is to check if they appeared for the interview and collect feedback. If not appeared, nudge them to reschedule as soon as possible.",
    shortLabel: 'Check interview status',
  },
  'vc': {
    goal: "Candidate is in interview process (telephonic or video call stage). Message goal is to check if they appeared for the interview and collect feedback. If not appeared, nudge them to reschedule as soon as possible.",
    shortLabel: 'Check interview status',
  },
  'f2f': {
    goal: "Candidate has a Face to Face interview scheduled or pending. Message goal is to confirm they are going for the interview, remind them of the company name and role, and ask them to confirm the date and time.",
    shortLabel: 'Confirm F2F interview',
  },
  'offered': {
    goal: "Candidate has received a job offer. Message goal is to get their confirmation on accepting the offer and ask for their expected joining date. Create a sense of excitement about the opportunity.",
    shortLabel: 'Get joining confirmation',
  },
  'backout': {
    goal: "Candidate who was selected has backed out or gone cold after offer. Message goal is to understand their concern, re-engage them gently without being pushy, and see if the issue can be resolved (salary, location, notice period etc.)",
    shortLabel: 'Re-engage after backout',
  },
  'position on hold': {
    goal: "The position is on hold from client side. Message goal is to inform the candidate politely that there is a slight delay from client side, assure them we are still working on it, and keep them engaged so they don't join elsewhere.",
    shortLabel: 'Inform about delay',
  },
  'interview reject': {
    goal: "Candidate was rejected after interview. Message goal is to empathize, keep the relationship warm, and inform them that we have other suitable opportunities and will reach out soon. Do NOT make them feel bad.",
    shortLabel: 'Empathize & retain',
  },
  'reject': {
    goal: "Candidate's profile was rejected by client before interview. Message goal is to keep the conversation warm, tell them we are looking at other options for their profile and will get back to them soon.",
    shortLabel: 'Keep warm after reject',
  },
  'offer backout': {
    goal: "Candidate accepted offer but is now backing out before joining. This is urgent. Message goal is to urgently but calmly understand their concern and try to save the joining. Ask for a quick call to discuss.",
    shortLabel: 'Save joining urgently',
  },
  'uselater': {
    goal: "Candidate profile is saved for future use. Message goal is to check in casually, see if they are still looking for a job change, and understand their current situation and timeline.",
    shortLabel: 'Casual check-in',
  },
  'duplicate': {
    goal: '',
    shortLabel: 'No message needed — duplicate profile',
  },
  'joined': {
    goal: "Candidate has joined. Message goal is to congratulate them warmly on their first day/week and check how their experience is going. Build long term relationship.",
    shortLabel: 'Congratulate on joining',
  },
};

const DEFAULT_GOAL = {
  goal: "Send a general warm check-in message asking for a quick update on their job search status.",
  shortLabel: 'General check-in',
};

export function getMessageGoal(stage: string, clientStatus: string): { goal: string; shortLabel: string; isDuplicate: boolean } {
  const normalizedStage = (stage || '').trim().toLowerCase();
  const normalizedStatus = (clientStatus || '').trim().toLowerCase();

  if (normalizedStage === 'duplicate' || normalizedStatus === 'duplicate') {
    return { ...STAGE_GOALS['duplicate'], isDuplicate: true };
  }

  // Check clientStatus first (more specific), then stage
  const match = STAGE_GOALS[normalizedStatus] || STAGE_GOALS[normalizedStage];
  if (match) return { ...match, isDuplicate: false };

  return { ...DEFAULT_GOAL, isDuplicate: false };
}
