/**
 * Progress Tracker - Records test results, tracks growth, manages streaks
 * Uses localStorage for persistence
 */
const ProgressTracker = {
    STORAGE_KEY: 'jmlt_prep_progress',
    SETTINGS_KEY: 'jmlt_prep_settings',
    data: null,

    init() {
        this.load();
        this.updateStreak();
    },

    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            this.data = raw ? JSON.parse(raw) : this.getDefault();
        } catch (e) {
            this.data = this.getDefault();
        }
    },

    getDefault() {
        return {
            tests: [],
            bookmarks: [],
            studiedNotes: [],
            streak: { current: 0, longest: 0, lastDate: null },
            dailyActivity: {},
            subjectPerformance: {},
            totalStudyTime: 0,
            firstUse: new Date().toISOString()
        };
    },

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    },

    recordTest(result) {
        this.data.tests.push(result);
        const sub = result.subject || 'mixed';
        if (!this.data.subjectPerformance[subr]) {
            this.data.subjectPerformance[subj] = { tests: 0, totalCorrect: 0, totalQuestions: 0, bestPercent: 0, history: [] };
        }
        const sp = this.data.subjectPerformance[sub];
        sp.tests++;
        sp.totalCorrect += result.correct;
        sp.totalQuestions += result.total;
        sp.bestPercent = Math.max(sp.bestPercent, result.percentage);
        sp.history.push({ date: result.date, percentage: result.percentage });
        const today = new Date().toISOString().split('T')[0];
        if (!this.data.dailyActivity[today]) {
            this.data.dailyActivity[today] = { tests: 0, questions: 0 };
        }
        this.data.dailyActivity[today].tests++;
        this.data.dailyActivity[today].questions += result.total;
        this.data.totalStudyTime += result.timeTaken || 0;
        this.updateStreak();
        this.save();
    },

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (this.data.streak.lastDate === today) { 
        } else if (this.data.streak.lastDate === yesterday) {
            this.data.streak.current++;
        } else if (this.data.streak.lastDate !== today) {
            this.data.streak.current = 1;
        }
        this.data.streak.lastDate = today;
        this.data.streak.longest = Math.max(this.data.streak.longest, this.data.streak.current);
    },

    getStreak() { return this.data.streak; },

    getStats() {
        const tests = this.data.tests;
        const totalTests = tests.length;
        const avgPercent = tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length) : 0;
        const totalQuestions = tests.reduce((sum, t) => sum + t.total, 0);
        const totalCorrect = tests.reduce((sum, t) => sum + t.correct, 0);
        return { totalTests, avgPercent, totalQuestions, 
totalCorrect, accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
streak: this.data.streak.current,
studyTime: this.data.totalStudyTime,
subjectPerformance: this.data.subjectPerformance,
dailyActivity: this.data.dailyActivity};
    },

    getRecentTests(limit = 10) { return this.data.tests.slice(-limit).reverse(); },

    toggleBookmarc(mcqId) {
        const idx = this.data.bookmarks.indexOf(mcqId);
        if (idx >= 0) { this.data.bookmarks.splice(idx, 1); return false; }
        else { this.data.bookmarks.push(mcqId); return true; }
    },

    getBookmarks() { return this.data.bookmarks; },

    markNoteStudied(noteId) {
        if (!this.data.studiedNotes.includes(noteId)) { this.data.studiedNotes.push(noteId); this.save(); }
    },

    getStudiedNotes() { return this.data.studiedNotes; },

    getSubjectPerformanceData() {
        const subjects = this.data.subjectPerformance;
        const labels = [];const data = [];
const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        Object.entries(subjects).forEach(([key, val]) => {
const name = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
labels.push(name);data.push({avgPercent: val.totalQuestions > 0 ? Math.round((val.totalCorrect / val.totalQuestions) * 100) : 0,
tests: val.tests,
best: val.bestPercent});
        });
        return { labels, data, colors };
    },

    getProgressOverTime() {
        const tests = this.data.tests;
        if (tests.length === 0) return { labels: [], data: [] };
        const byDate = {};
        tests.forEach(t => { const date = t.date.split('T')[0]; if (!byDate[date]) byDate[date] = []; byDate[date].push(t.percentage); });
        const labels = Object.keys(byDate).sort();
        const data = labels.map(d => { const pcts = byDate[d]; return Math.round(pcts.reduce((a,b) => a+b, 0) / pcts.length); });
        return { labels, data };
    },

    getDailyActivityData() {
        const activity = this.data.dailyActivity;
        const dates = Object.keys(activity).sort().slice(-30);
        return { labels: dates, questions: dates.map(d => activity[d].questions), tests: dates.map(d => activity[d].tests) };
    },

    resetAll() { this.data = this.getDefault(); this.save(); }
};

const Settings = {
    get(key, defaultValue = null) {
        try { const raw = localStorage.getItem(ProgressTracker.SETTINGS_KEY);
        const settings = raw ? JSON.parse(raw) : {};
        return settings[key] !== undefined ? settings[key] : defaultValue; } catch (e) { return defaultValue; }
    },
    set(key, value) {
        try { const raw = localStorage.getItem(ProgressTracker.SETTINGS_KEY); const settings = raw ? JSON.parse(raw) : {}; settings[key] = value; localStorage.setItem(ProgressTracker.SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { console.error('Failed to save setting:', e); }
    },
    getAll() { try { const raw = localStorage.getItem(ProgressTracker.SETTINGS_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
};
