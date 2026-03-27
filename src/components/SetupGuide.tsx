import { FileText, AlertTriangle, Info } from 'lucide-react';

interface SetupGuideProps {
  onContinue: () => void;
}

const tabData = [
  {
    name: 'MASTER TRACKER',
    purpose: 'Tracks every candidate in the pipeline',
    columns: [
      '5 Stages', 'Client Status', 'Year', 'Month', 'Date', 'TL', 'AM',
      'Recruiter', 'Organisation', 'Role', 'Location', 'Candidate Name',
      'Contact', 'Email ID', 'Total Experience', 'CTC', 'Expected',
      'Notice Period', 'Current Company', 'Status',
    ],
  },
  {
    name: 'SELECTION SHEET',
    purpose: 'Tracks selected & joined candidates',
    columns: [
      'Sr. No.', 'Month', 'Year', 'Selection Date', 'Candidate Name',
      'Contact Number', 'Email ID', 'Company', 'Location', 'Designation',
      'CTC Offered', 'Joining Date', 'Recruiter', 'Candidate Status',
      'Lead Source', 'Joining Confirmation', 'Manual Lead',
      'Client POC Name', 'Client Payout', 'Cooling Date',
      'Date of Last Interaction',
    ],
  },
  {
    name: 'EOD SHEET',
    purpose: 'Daily activity tracker per recruiter',
    columns: [],
  },
];

export const SetupGuide = ({ onContinue }: SetupGuideProps) => (
  <div className="fixed inset-0 overflow-y-auto" style={{ background: '#080B11' }}>
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Before You Begin 📋</h1>
        <p className="text-sm text-muted-foreground">
          Make sure your Google Sheet is set up exactly as described below for RecruitPulse AI to work correctly
        </p>
      </div>

      <p className="text-center text-sm font-semibold text-white/80">
        Your Google Sheet must have exactly 3 tabs with these exact names:
      </p>

      {/* Tab cards */}
      {tabData.map((tab, i) => (
        <div key={tab.name} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#00E5A0]" />
            <h2 className="text-base font-bold text-white">
              TAB {i + 1} — "{tab.name}"
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">Purpose: {tab.purpose}</p>

          {tab.columns.length > 0 ? (
            <>
              <p className="text-xs font-medium text-white/70">
                Required columns (Row 1 must be the header row):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tab.columns.map((c) => (
                  <span key={c} className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                    {c}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-white/70 space-y-1">
              <p><span className="font-semibold">Column A:</span> "Details" — contains activity names: CV to TL, AI CV, CV to Client, 1st Round Interview, Final Interview, Total Calls, Selection, Joinings</p>
              <p><span className="font-semibold">Row 1:</span> Dates in format DD-Month-YY (e.g. 5-March-26, 6-March-26…)</p>
              <p>Each recruiter has their own section with their name as a section header row</p>
              <p>Data cells contain daily numeric counts</p>
            </div>
          )}
        </div>
      ))}

      {/* Warning card */}
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h3 className="text-sm font-bold text-yellow-300">⚠️ Important Rules</h3>
        </div>
        <ol className="list-decimal list-inside text-xs text-yellow-200/80 space-y-1">
          <li>Tab names must be EXACTLY as above — spelling and capitalization must match</li>
          <li>Row 1 of Master Tracker and Selection Sheet must be the header row with exact column names</li>
          <li>Do not merge any cells in Row 1</li>
          <li>The Sheet must be owned by the same Google account you use to connect OAuth</li>
          <li>Make sure the Sheet is not restricted — the connected Google account must have at least "Editor" access</li>
        </ol>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-blue-300">📌 How to Find Your Sheet ID</h3>
        </div>
        <p className="text-xs text-blue-200/80">
          Your Google Sheet ID is the long string in the URL between <code className="bg-blue-500/20 px-1 rounded">/d/</code> and <code className="bg-blue-500/20 px-1 rounded">/edit</code>
        </p>
        <p className="text-[11px] text-blue-300/70 break-all">
          docs.google.com/spreadsheets/d/<span className="font-bold text-blue-200">[THIS-IS-YOUR-SHEET-ID]</span>/edit
        </p>
        <p className="text-xs text-blue-200/80">Copy only the ID part and paste it in the next screen</p>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3 pt-2 pb-6">
        <button
          onClick={onContinue}
          className="rounded-full px-8 py-3 text-sm font-bold text-black"
          style={{ background: 'linear-gradient(135deg, #00E5A0, #00B4D8)' }}
        >
          My Sheet is Ready, Continue →
        </button>
        <p className="text-xs text-muted-foreground">
          Need help?{' '}
          <span className="underline cursor-pointer text-white/60">Download sample sheet template</span>
        </p>
      </div>
    </div>
  </div>
);
