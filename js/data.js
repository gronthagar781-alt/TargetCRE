/**
 * Data Management Module
 * Handles loading and caching of MCQs, notes, and subjects
 */
const DataStore = {
    subjects: [],
    mcqCache: {},
    notesCache: {},
    allMcqs: null,
    allNotes: null,

    async init() {
        try {
            const res = await fetch('data/subjects.json');
            this.subjects = await res.json();
        } catch (e) {
            console.error('Failed to load subjects:', e);
            this.subjects = [];
        }
        try {
            const res = await fetch('data/all_mcqs.json');
            this.allMcqs = await res.json();
        } catch (e) {
            console.warn('Could not preload all MCQs, will lazy-load per subject');
        }
        try {
            const res = await fetch('data/all_notes.json');
            this.allNotes = await res.json();
        } catch (e) {
            console.warn('Could not preload all notes');
        }
    },

    getSubjects() {
        return this.subjects;
    },

    getSubject(id) {
        return this.subjects.find(s => s.id === id);
    },

    async getMcqsBySubject(subjectId) {
        if (this.mcqCache[subjectId]) return this.mcqCache[subjectId];
        if (this.allMcqs) {
            this.mcqCache[subjectId] = this.allMcqs.filter(m => m.subject_id === subjectId);
            return this.mcqCache[subjectId];
        }
        try {
            const res = await fetch(`data/${subjectId}_mcqt.json`);
            this.mcqCache[subjectId] = await res.json();
            return this.mcqCache[subjectId];
        } catch (e) {
            console.error(`Failed to load MCQs for ${subjectId}:`, e);
            return [];
        }
    },

    async getNotesBySubject(subjectId) {
        if (this.notesCache[subjectId]) return this.notesCache[subjectId];
        if (this.allNotes) {
            this.notesCache[subjectId] = this.allNotes.filter(n => n.subject_id === subjectId);
            return this.notesCache[subjectId];
        }
        try {
            const res = await fetch(`data/${subjectId}_notes.json`);
            this.notesCache[subjectId] = await res.json();
            return this.notesCache[subjectId];
        } catch (e) {
            console.error(`Failed to load notes for ${subjectId}:`, e);
            return [];
        }
    },

    async getMcqsByChapter(subjectId, chapter) {
        const mcqs = await this.getMcqsBySubject(subjectId);
        return mcqs.filter(m => m.subcategory === chapter);
    },

    async getRandomMcqs(count, subjectId = null, chapter = null) {
        let pool;
        if (subjectId) {
            if (chapter) {
                pool = await this.getMcqsByChapter(subjectId, chapter);
            } else {
                pool = await this.getMcqsBySubject(subjectId);
            }
        } else {
            pool = this.allMcqs || [];
        }
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },

    async searchMcqs(query) {
        const pool = this.allMcqs || [];
        const q = query.toLowerCase();
        return pool.filter(m => 
            m.question.toLowerCase().includes(q) ||
            Object.values(m.options || {}).some(o => o.toLowerCase().includes(q))
        );
    },

    getTotalMcqCount() {
        return this.allMcqs ? this.allMcqs.length : 0;
    },

    getTotalNoteCount() {
        return this.allNotes ? this.allNotes.length : 0;
    }
};
