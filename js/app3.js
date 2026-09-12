/**
 * App Part 3: Rapid Quiz, Current Affairs, Growth Analysis
 */
Object.assign(App, {
    // ============ RAPID QUIZ ============
    renderRapidQuiz() {
        const isBn = this.language === 'bn';
        const t = (en, bn) => isBn ? bn : en;

        let html = `
            <h2 class="text-xl font-bold mb-4">${t('Rapid Quiz', 'র‍্যাপিড কুইজ')} ⚡</h2>
            <p class="text-secondary mb-6">${t('Quick fire questions to test your speed!', 'দ্রুত উত্তর দিয়ে নিজেকে যাচাই করুন!')}</p>
            <div class="grid grid-4">
                <div class="card text-center">
                    <div class="text-2xl mb-2">⚡</div>
                    <h3 class="font-bold">10 ${t('Questions', 'প্রশ্ন')}</h3>
                    <p class="text-sm text-secondary">5 ${t('min', 'মিনিট')}</p>
                    <button class="btn btn-primary mt-3 btn-block" onclick="App.startRapid(10, 5)">▶️ ${t('Go', 'শুরু')}</button>
                </div>
                <div class="card text-center">
                    <div class="text-2xl mb-2">🔥</div>
                    <h3 class="font-bold">20 ${t('Questions', 'প্রশ্ন')}</h3>
                    <p class="text-sm text-secondary">10 ${t('min', 'মিনিট')}</p>
                    <button class="btn btn-primary mt-3 btn-block" onclick="App.startRapid(20, 10)">▶️ ${t('Go', 'শুরু')}</button>
                </div>
                <div class="card text-center">
                    <div class="text-2xl mb-2">💀</div>
                    <h3 class="font-bold">30 ${t('Questions', 'প্রশ্ন')}</h3>
                    <p class="text-sm text-secondary">15 ${t('min', 'মিনিট')}</p>
                    <button class="btn btn-primary mt-3 btn-block" onclick="App.startRapid(30, 15)">▶️ ${t('Go', 'শুরু')}</button>
                </div>
                <div class="card text-center">
                    <div class="text-2xl mb-2">🏆</div>
                    <h3 class="font-bold">50 ${t('Questions', 'প্রশ্ন')}</h3>
                    <p class="text-sm text-secondary">25 ${t('min', 'মিনিট')}</p>
                    <button class="btn btn-primary mt-3 btn-block" onclick="App.startRapid(50, 25)">▶️ ${t('Go', 'শুরু')}</button>
                </div>
            </div>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    async startRapid(count, time) {
        const mcqs = await DataStore.getRandomMcqs(count);
        this.currentQuizOptions = { mode: 'rapid', subject: 'mixed', duration: time };
        QuizEngine.start(mcqs, { mode: 'rapid', duration: time });
    },

    // ============ CURRENT AFFAIRS ============
    async renderCurrentAffairs() {
        const isBn = this.language === 'bn';
        const t = (en, bn) => isBn ? bn : en;
        
        const caSubject = DataStore.getSubject('current_affairs');
        const mcqs = await DataStore.getMcqsBySubject('current_affairs');
        
        // Group by month
        const byMonth = {};
        mcqs.forEach(m => {
            const month = m.subcategory || 'General';
            if (!byMonth[month]) byMonth[month] = [];
            byMonth[month].push(m);
        });

        let html = `
            <h2 class="text-xl font-bold mb-4">${t('Current Affairs', 'সাম্প্রতিক ঘটনা')} 📰</h2>
            <p class="text-secondary mb-6">${t('Monthly current affairs MCQs from January to August 2026', 'জানুয়ারি থেকে আগস্ট ২০২৬ পর্যন্ত মাসিক সাম্প্রতিক ঘটনা')}</p>
            
            <div class="grid grid-3 mb-6">
        `;

        Object.keys(byMonth).sort().forEach(month => {
            const count = byMonth[month].length;
            html += `
                <div class="subject-card" onclick="App.startCurrentAffairsQuiz('${this.escapeAttr(month)}')">
                    <div class="subject-icon">📅</div>
                    <div class="subject-name">${month}</div>
                    <div class="subject-stats"><span>📝 ${count} ${t('MCQs', 'প্রশ্ন')}</span></div>
                </div>
            `;
        });

        html += `</div>`;
        
        html += `
            <div class="card text-center">
                <h3 class="font-bold mb-2">${t('Practice All Current Affairs', 'সব সাম্প্রতিক ঘটনা অনুশীলন')}</h3>
                <button class="btn btn-primary mt-2" onclick="App.startCurrentAffairsQuiz('all')">🎯 ${t('Start All', 'সব শুরু')} (${mcqs.length} ${t('MCQs', 'প্রশ্ন')})</button>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;
    },

    async startCurrentAffairsQuiz(month) {
        let mcqs;
        if (month === 'all') {
            mcqs = await DataStore.getMcqsBySubject('current_affairs');
        } else {
            mcqs = await DataStore.getMcqsByChapter('current_affairs', month);
        }
        const shuffled = [...mcqs].sort(() => Math.random() - 0.5).slice(0, Math.min(25, mcqs.length));
        this.currentQuizOptions = { mode: 'practice', subject: 'current_affairs' };
        QuizEngine.start(shuffled, { mode: 'practice' });
    },

    // ============ GROWTH ANALYSIS ============
    renderGrowth() {
        const stats = ProgressTracker.getStats();
        const isBn = this.language === 'bn';
        const t = (en, bn) => isBn ? bn : en;

        if (stats.totalTests === 0) {
            document.getElementById('page-content').innerHTML = `
                <div class="card text-center">
                    <div class="text-4xl mb-4">📊</div>
                    <h2 class="text-xl font-bold mb-2">${t('No Data Yet', 'এখনও কোনো ডেটা নেই')}</h2>
                    <p class="text-secondary mb-4">${t('Take some tests to see your growth analysis', 'আপনার গ্রোথ অ্যানালাইসিস দেখতে কিছু টেস্ট দিন')}</p>
                    <button class="btn btn-primary" onclick="App.navigate('practice')">${t('Start Practicing', 'অনুশীলন শুরু করুন')}</button>
                </div>
            `;
            return;
        }

        let html = `
            <h2 class="text-xl font-bold mb-6">${t('Growth Analysis', 'গ্রোথ অ্যানালাইসিস')} 📈</h2>
            
            <div class="grid grid-4 mb-6">
                <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${stats.totalTests}</div><div class="stat-label">${t('Tests', 'পরীক্ষা')}</div></div>
                <div class="stat-card" style="border-color:var(--success)"><div class="stat-icon">🎯</div><div class="stat-value" style="color:var(--success)">${stats.accuracy}%</div><div class="stat-label">${t('Accuracy', 'নির্ভুলতা')}</div></div>
                <div class="stat-card" style="border-color:var(--accent)"><div class="stat-icon">📊</div><div class="stat-value" style="color:var(--accent)">${stats.avgPercent}%</div><div class="stat-label">${t('Avg Score', 'গড় স্কোর')}</div></div>
                <div class="stat-card" style="border-color:var(--warning)"><div class="stat-icon">⏱️</div><div class="stat-value" style="color:var(--warning)">${Math.round(stats.studyTime/60)}m</div><div class="stat-label">${t('Study Time', 'অধ্যয়ন সময়')}</div></div>
            </div>

            <div class="chart-container mb-6">
                <h3 class="font-bold mb-4">${t('Score Progress Over Time', 'সময়ের সাথে স্কোরের অগ্রগতি')}</h3>
                <canvas id="progress-chart"></canvas>
            </div>

            <div class="chart-container mb-6">
                <h3 class="font-bold mb-4">${t('Subject-wise Performance', 'বিষয়ভিত্তিক পারফরম্যান্স')}</h3>
                <canvas id="subject-chart"></canvas>
            </div>

            <div class="chart-container mb-6">
                <h3 class="font-bold mb-4">${t('Daily Activity', 'দৈনিক কার্যকলাপ')}</h3>
                <canvas id="activity-chart"></canvas>
            </div>
        `;

        document.getElementById('page-content').innerHTML = html;

        // Render charts
        setTimeout(() => this.renderCharts(), 100);
    },

    renderCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(c => c?.destroy());

        const progressData = ProgressTracker.getProgressOverTime();
        const subjData = ProgressTracker.getSubjectPerformanceData();
        const activityData = ProgressTracker.getDailyActivityData();

        // Progress over time
        const ctx1 = document.getElementById('progress-chart');
        if (ctx1 && progressData.labels.length > 0) {
            this.charts.progress = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: progressData.labels.map(d => d.slice(5)),                    datasets: [{
                        label: 'Score %',
                        data: progressData.data,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79,70,229,0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                 },
                options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
            });
        }

        // Subject performance
        const ctx2 = document.getElementById('subject-chart');
        if (ctx2 && subjData.labels.length > 0) {
            this.charts.subject = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: subjData.labels,
                    datasets: [{
                        label: 'Avg %',
                        data: subjData.data.map(d => d.avgPercent),
                        backgroundColor: subjData.colors.slice(0, subjData.labels.length)
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
            });
        }

        // Daily activity
        const ctx3 = document.getElementById('activity-chart');
        if (ctx3 && activityData.labels.length > 0) {
            this.charts.activity = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: activityData.labels.map(d => d.slice(5)),
                    datasets: [{
                        label: 'Questions Answered',
                        data: activityData.questions,
                        backgroundColor: '#06b6d4'
                    }]
                },
                options: { responsive: true }
            });
        }
    }
});
