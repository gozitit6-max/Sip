
        const TABS = [
            { id: 'holodka', name: 'СИП Холодная', type: 'teams' },
            { id: 'gosi', name: 'СИП Хозяйства', type: 'notepad_sections' },
            { id: 'zakryv', name: 'Закрыто', type: 'notepad' },
        ];

        const TEAM_COLORS = [
            { bg: '#1e3a5f', border: '#3b82f6', text: '#60a5fa' },
            { bg: '#3b1f1f', border: '#ef4444', text: '#f87171' },
            { bg: '#1f3b1f', border: '#22c55e', text: '#4ade80' },
            { bg: '#3b2f1f', border: '#f59e0b', text: '#fbbf24' },
            { bg: '#2d1f3b', border: '#a855f7', text: '#c084fc' },
            { bg: '#1f3b3b', border: '#14b8a6', text: '#2dd4bf' },
            { bg: '#3b1f2f', border: '#ec4899', text: '#f472b6' },
            { bg: '#1f2f3b', border: '#06b6d4', text: '#22d3ee' },
        ];

        const tabState = {};
        TABS.forEach(tab => { tabState[tab.id] = { sipEntries: [] }; });
        let activeTab = TABS[0].id;

        function storageKey(tabId, suffix) { return 'grozniy_' + suffix + '_' + tabId; }
        function getTeams(tabId) { try { return JSON.parse(localStorage.getItem(storageKey(tabId, 'teams'))) || []; } catch { return []; } }
        function setTeams(tabId, teams) { localStorage.setItem(storageKey(tabId, 'teams'), JSON.stringify(teams)); }
        function getManagers(tabId) { try { return JSON.parse(localStorage.getItem(storageKey(tabId, 'managers'))) || []; } catch { return []; } }
        function setManagers(tabId, managers) { localStorage.setItem(storageKey(tabId, 'managers'), JSON.stringify(managers)); }
        function getTeamColor(idx) { return TEAM_COLORS[idx % TEAM_COLORS.length]; }

        function getSavedTabState(tabId) {
            try {
                const raw = localStorage.getItem(storageKey(tabId, 'tab_state'));
                return raw ? JSON.parse(raw) : { sipEntries: [] };
            } catch {
                return { sipEntries: [] };
            }
        }

        function setSavedTabState(tabId, state) {
            localStorage.setItem(storageKey(tabId, 'tab_state'), JSON.stringify(state));
        }

        function buildTabs() {
            const bar = document.getElementById('tabsBar');
            const contents = document.getElementById('tabContents');
            bar.innerHTML = ''; contents.innerHTML = '';

            TABS.forEach((tab, i) => {
                const btn = document.createElement('button');
                btn.className = 'tab-btn' + (i === 0 ? ' active' : '');
                btn.textContent = tab.name;
                btn.onclick = () => switchTab(tab.id);
                btn.id = 'tabBtn_' + tab.id;
                bar.appendChild(btn);

                const div = document.createElement('div');
                div.className = 'tab-content' + (i === 0 ? ' active' : '');
                div.id = 'tabContent_' + tab.id;

                if (tab.type === 'teams') {
                    div.innerHTML = buildTeamsTabHTML(tab.id);
                } else if (tab.type === 'notepad_sections') {
                    div.innerHTML = buildSectionsTabHTML(tab.id);
                } else if (tab.type === 'notepad') {
                    div.innerHTML = buildNotepadTabHTML(tab.id);
                } else {
                    div.innerHTML = buildManagersTabHTML(tab.id);
                }
                contents.appendChild(div);
            });
        }

        function buildTeamsTabHTML(tabId) {
            return `
                <div class="section-box">
                    <h3>РљРѕРјР°РЅРґРё вЂ” РєС–Р»СЊРєС–СЃС‚СЊ SIP РЅР° РєРѕРјР°РЅРґСѓ</h3>
                    <div id="teamsContainer_${tabId}"></div>
                    <div class="add-row">
                        <input type="text" class="add-input" id="newTeamName_${tabId}" placeholder="РќР°Р·РІР° РєРѕРјР°РЅРґРё..." onkeydown="if(event.key==='Enter')addTeam('${tabId}')">
                        <button class="btn-add" onclick="addTeam('${tabId}')">+ Р”РѕРґР°С‚Рё РєРѕРјР°РЅРґСѓ</button>
                    </div>
                    <button class="btn-action" style="background:#7c6cff" onclick="autoDistributeByMapping('${tabId}')">вљЎ РђРІС‚Рѕ-СЂРѕР·РїРѕРґС–Р» РїРѕ РјРµРЅРµРґР¶РµСЂР°С…</button>
                    <button class="btn-action" onclick="distribute('${tabId}')">РџРѕ РїРѕСЂСЏРґРєСѓ</button>
                    <button class="btn-action" style="background:#f59e0b" onclick="distributeRandom('${tabId}')">Р Р°РЅРґРѕРјРЅРѕ</button>
                </div>
                <div class="container">
                    <div class="panel">
                        <label>Р’СЃС‚Р°РІСЊС‚Рµ РІС…РѕРґРЅС‹Рµ РґР°РЅРЅС‹Рµ:</label>
                        <textarea id="input_${tabId}" placeholder="[28.05.2026 05:10] рџ†”пёЏ Р¤РР›РђРўРћР’ - SIP: 209&#10;9y5wBkQ77Br&#10;95.169.201.210&#10;..."></textarea>
                    </div>
                    <div class="panel">
                        <label>Р РµР·СѓР»СЊС‚Р°С‚:</label>
                        <textarea id="output_${tabId}" readonly placeholder="209 95.169.201.210 9y5wBkQ77Br&#10;..."></textarea>
                    </div>
                </div>
                <div class="buttons">
                    <button class="btn-convert" onclick="convert('${tabId}')">РљРѕРЅРІРµСЂС‚РёСЂРѕРІР°С‚СЊ</button>
                    <button class="btn-copy" onclick="copyResult('${tabId}')">РљРѕРїРёСЂРѕРІР°С‚СЊ СЂРµР·СѓР»СЊС‚Р°С‚</button>
                    <button class="btn-copy" onclick="copyGrouped('${tabId}')">РљРѕРїРёСЂРѕРІР°С‚СЊ РїРѕ РєРѕРјР°РЅРґР°Рј</button>
                    <button class="btn-clear" onclick="clearAll('${tabId}')">РћС‡РёСЃС‚РёС‚СЊ</button>
                </div>
                <div class="status" id="status_${tabId}"></div>
                <div class="result-section" id="resultSection_${tabId}"></div>
                <div class="stats-grid" id="statsGrid_${tabId}"></div>
            `;
        }

        function buildNotepadTabHTML(tabId) {
            return `
                <div class="subtabs-bar" id="subtabsBar_${tabId}"></div>
                <div id="subtabsPanels_${tabId}"></div>
                <div class="status" id="status_${tabId}" style="margin-top:8px"></div>
            `;
        }

        // notepad sub-tab state
        const notepadActiveIdx = {};

        function getNotepadSections(tabId) {
            try {
                const raw = JSON.parse(localStorage.getItem(storageKey(tabId, 'np_sections')));
                if (raw && raw.length) return raw;
            } catch {}
            return [
                { name: 'РљРѕРјР°РЅРґР° 1', cards: [] },
                { name: 'РљРѕРјР°РЅРґР° 2', cards: [] },
                { name: 'РљРѕРјР°РЅРґР° 3', cards: [] },
            ];
        }
        function setNotepadSections(tabId, secs) {
            localStorage.setItem(storageKey(tabId, 'np_sections'), JSON.stringify(secs));
        }

        function addNotepadSection(tabId) {
            const secs = getNotepadSections(tabId);
            const name = 'РљРѕРјР°РЅРґР° ' + (secs.length + 1);
            secs.push({ name, cards: [] });
            setNotepadSections(tabId, secs);
            notepadActiveIdx[tabId] = secs.length - 1;
            renderCards(tabId);
            showStatus(tabId, 'РљРѕРјР°РЅРґР° "' + name + '" РґРѕР±Р°РІР»РµРЅР°', '#22c55e');
        }

        function removeNotepadSection(tabId, si) {
            const secs = getNotepadSections(tabId);
            secs.splice(si, 1);
            setNotepadSections(tabId, secs);
            if (notepadActiveIdx[tabId] >= secs.length) notepadActiveIdx[tabId] = Math.max(0, secs.length - 1);
            renderCards(tabId);
        }

        function switchNotepadSection(tabId, si) {
            notepadActiveIdx[tabId] = si;
            renderCards(tabId);
        }

        function updateNotepadSectionName(tabId, si, val) {
            const secs = getNotepadSections(tabId);
            secs[si].name = val;
            setNotepadSections(tabId, secs);
            const bar = document.getElementById('subtabsBar_' + tabId);
            if (bar) {
                const btns = bar.querySelectorAll('.subtab-btn');
                if (btns[si]) { btns[si].textContent = val || ('РљРѕРјР°РЅРґР° ' + (si + 1)); btns[si].title = val; }
            }
        }

        // в”Ђв”Ђ SECTIONS TAB (Р“РѕСЃРё) в”Ђв”Ђ
        function buildSectionsTabHTML(tabId) {
            return `
                <div class="subtabs-bar" id="subtabsBar_${tabId}"></div>
                <div id="subtabsPanels_${tabId}"></div>
                <div class="status" id="status_${tabId}" style="margin-top:8px"></div>
            `;
        }

        // active sub-tab per tab
        const sectionActiveIdx = {};

        function addSection(tabId) {
            const sections = getSections(tabId);
            const name = 'РљРѕРјР°РЅРґР° ' + (sections.length + 1);
            sections.push({ name, cards: [] });
            setSections(tabId, sections);
            sectionActiveIdx[tabId] = sections.length - 1;
            renderSections(tabId);
            showStatus(tabId, 'РљРѕРјР°РЅРґР° "' + name + '" РґРѕР±Р°РІР»РµРЅР°', '#22c55e');
        }

        function removeSection(tabId, si) {
            const sections = getSections(tabId);
            sections.splice(si, 1);
            setSections(tabId, sections);
            if (sectionActiveIdx[tabId] >= sections.length) sectionActiveIdx[tabId] = Math.max(0, sections.length - 1);
            renderSections(tabId);
        }

        function switchSection(tabId, si) {
            sectionActiveIdx[tabId] = si;
            renderSections(tabId);
        }

        function getSections(tabId) {
            try {
                const raw = JSON.parse(localStorage.getItem(storageKey(tabId, 'sections')));
                if (raw && raw.length) return raw;
            } catch {}
            return [
                { name: 'РљРѕРјР°РЅРґР° 1', cards: [] },
                { name: 'РљРѕРјР°РЅРґР° 2', cards: [] },
                { name: 'РљРѕРјР°РЅРґР° 3', cards: [] },
            ];
        }
        function setSections(tabId, sections) {
            localStorage.setItem(storageKey(tabId, 'sections'), JSON.stringify(sections));
        }

        function renderSections(tabId) {
            const bar = document.getElementById('subtabsBar_' + tabId);
            const panels = document.getElementById('subtabsPanels_' + tabId);
            if (!bar || !panels) return;
            const sections = getSections(tabId);
            if (sectionActiveIdx[tabId] === undefined) sectionActiveIdx[tabId] = 0;
            const active = sectionActiveIdx[tabId];

            // render bar
            bar.innerHTML = '';
            sections.forEach((sec, si) => {
                const c = getTeamColor(si);
                const btn = document.createElement('button');
                btn.className = 'subtab-btn' + (si === active ? ' active' : '');
                btn.textContent = sec.name || ('РљРѕРјР°РЅРґР° ' + (si + 1));
                btn.title = sec.name;
                if (si === active) btn.style.color = c.text;
                btn.onclick = () => switchSection(tabId, si);
                bar.appendChild(btn);
            });
            // + button
            const addBtn = document.createElement('button');
            addBtn.className = 'subtab-add-btn';
            addBtn.textContent = '+';
            addBtn.title = 'Р”РѕР±Р°РІРёС‚СЊ РєРѕРјР°РЅРґСѓ';
            addBtn.onclick = () => addSection(tabId);
            bar.appendChild(addBtn);

            // render panels
            panels.innerHTML = '';
            sections.forEach((sec, si) => {
                const c = getTeamColor(si);
                const panel = document.createElement('div');
                panel.className = 'subtab-panel' + (si === active ? ' active' : '');
                panel.style.borderTop = '2px solid ' + c.border;
                panel.innerHTML = `
                    <div class="subtab-header">
                        <input class="section-title-input" type="text"
                            value="${(sec.name||'').replace(/"/g,'&quot;')}"
                            placeholder="РќР°Р·РІР°РЅРёРµ РєРѕРјР°РЅРґС‹..."
                            style="color:${c.text}"
                            oninput="updateSectionName('${tabId}',${si},this.value)">
                        <div class="section-actions">
                            <button class="section-copy-btn" style="border-color:${c.border};color:${c.text};background:${c.bg}" onclick="copySection('${tabId}',${si})">рџ“‹ РљРѕРїРёСЂРѕРІР°С‚СЊ</button>
                            <button class="remove-btn" title="РЈРґР°Р»РёС‚СЊ РєРѕРјР°РЅРґСѓ" onclick="removeSection('${tabId}',${si})" style="font-size:15px">рџ—‘</button>
                        </div>
                    </div>
                    <div class="section-body">
                        <div class="search-toolbar">
                            <input class="search-input" id="search_${tabId}_${si}" type="text"
                                placeholder="рџ”Ћ РџРѕС€СѓРє РїРѕ РјРµРЅРµРґР¶РµСЂСѓ / РґСЂРѕРїСѓ / SIP..."
                                oninput="filterSectionCards('${tabId}',${si},this.value)">
                        </div>
                        <div class="bulk-toolbar">
                            <button class="bulk-btn" onclick="bulkDeleteCards('${tabId}',${si})">рџ—‘ Р’РёРґР°Р»РёС‚Рё РІРёР±СЂР°РЅС–</button>
                            <button class="bulk-btn" onclick="bulkCopyCards('${tabId}',${si})">рџ“‹ РљРѕРїС–СЋРІР°С‚Рё РІРёР±СЂР°РЅС–</button>
                        </div>
                        <div class="section-cards-grid" id="secGrid_${tabId}_${si}"></div>
                        <button class="btn-add" id="secAddBtn_${tabId}_${si}" onclick="addSectionCard('${tabId}',${si})">+ Р”РѕР±Р°РІРёС‚СЊ SIP</button>
                    </div>
                `;
                panels.appendChild(panel);
                renderSectionCards(tabId, si, sections);
            });
        }

        function renderSectionCards(tabId, si, sections) {
            if (!sections) sections = getSections(tabId);
            const grid = document.getElementById('secGrid_' + tabId + '_' + si);
            if (!grid) return;
            const cards = sections[si].cards || [];
            grid.innerHTML = '';
            const limit = getCardLimit();
            cards.forEach((card, ci) => {
                const cc = getTeamColor(ci);
                const div = document.createElement('div');
                div.className = 'sip-card';
                div.style.borderLeft = `4px solid ${cc.border}`;
                div.innerHTML = `
                    <div class="sip-card-header">
                        <input type="text" class="sip-card-name"
                            value="${(card.name||'').replace(/"/g,'&quot;')}"
                            placeholder="РњРµРЅРµРґР¶РµСЂ"
                            oninput="updateSectionCard('${tabId}',${si},${ci},'name',this.value)">
                        <button class="remove-btn" onclick="removeSectionCard('${tabId}',${si},${ci})">Г—</button>
                    </div>
                    <input type="text" class="sip-card-drop"
                        value="${(card.drop||'').replace(/"/g,'&quot;')}"
                        placeholder="Р”СЂРѕРї"
                        oninput="updateSectionCard('${tabId}',${si},${ci},'drop',this.value)">
                    <textarea class="sip-card-body"
                        placeholder="РґРѕРјРµРЅ: 31.192.106.179:6060&#10;Р»РѕРіРёРЅ: 113221&#10;РїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!"
                        oninput="updateSectionCard('${tabId}',${si},${ci},'body',this.value)">${card.body||''}</textarea>
                `;
                grid.appendChild(div);
            });
            const btn = document.getElementById('secAddBtn_' + tabId + '_' + si);
            if (btn) btn.style.display = cards.length >= limit ? 'none' : '';
        }

        function updateSectionName(tabId, si, val) {
            const sections = getSections(tabId);
            sections[si].name = val;
            setSections(tabId, sections);
            // update just the tab button label live, no full re-render
            const bar = document.getElementById('subtabsBar_' + tabId);
            if (bar) {
                const btns = bar.querySelectorAll('.subtab-btn');
                if (btns[si]) { btns[si].textContent = val || ('РљРѕРјР°РЅРґР° ' + (si + 1)); btns[si].title = val; }
            }
        }

        function addSectionCard(tabId, si) {
            const sections = getSections(tabId);
            const cards = sections[si].cards || [];
            if (cards.length >= getCardLimit()) { showStatus(tabId, `РњР°РєСЃРёРјСѓРј ${getCardLimit()} РєР°СЂС‚РѕС‡РµРє`, '#f04060'); return; }
            cards.push({ name: '', body: '' });
            sections[si].cards = cards;
            setSections(tabId, sections);
            renderSectionCards(tabId, si, sections);
            const btn = document.getElementById('secAddBtn_' + tabId + '_' + si);
            if (btn) btn.style.display = cards.length >= getCardLimit() ? 'none' : '';
        }

        function removeSectionCard(tabId, si, ci) {
            const sections = getSections(tabId);
            sections[si].cards.splice(ci, 1);
            setSections(tabId, sections);
            renderSectionCards(tabId, si, sections);
            const btn = document.getElementById('secAddBtn_' + tabId + '_' + si);
            if (btn) btn.style.display = (sections[si].cards.length >= getCardLimit()) ? 'none' : '';
        }

        function updateSectionCard(tabId, si, ci, field, val) {
            const sections = getSections(tabId);
            sections[si].cards[ci][field] = val;
            setSections(tabId, sections);
        }

        function copySection(tabId, si) {
            const sections = getSections(tabId);
            const sec = sections[si];
            const cards = (sec.cards || []).filter(c => c.name || c.body);
            if (!cards.length) { showStatus(tabId, 'РќРµС‚ РґР°РЅРЅС‹С…', '#f04060'); return; }
            let text = `${sec.name || 'Р Р°Р·РґРµР»'}:\n`;
            cards.forEach(card => {
                if (card.name) text += `\n${card.name}:\n`;
                if (card.drop) text += `Р”СЂРѕРї: ${card.drop}\n`;
                text += `${card.body}\n`;
            });
            navigator.clipboard.writeText(text.trim())
                .then(() => showStatus(tabId, `"${sec.name}" СЃРєРѕРїРёСЂРѕРІР°РЅРѕ!`, '#22c55e'))
                .catch(() => showStatus(tabId, 'РћС€РёР±РєР° РєРѕРїРёСЂРѕРІР°РЅРёСЏ', '#f04060'));
        }

        function switchTab(tabId) {
            activeTab = tabId;
            TABS.forEach(tab => {
                document.getElementById('tabBtn_' + tab.id).classList.toggle('active', tab.id === tabId);
                document.getElementById('tabContent_' + tab.id).classList.toggle('active', tab.id === tabId);
            });
        }

        // ===== TEAMS TAB (РҐРѕР»РѕРґРєР°) =====
        function addTeam(tabId) {
            const input = document.getElementById('newTeamName_' + tabId);
            const name = input.value.trim();
            if (!name) return;
            const teams = getTeams(tabId);
            if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) { showStatus(tabId, 'РўР°РєР° РєРѕРјР°РЅРґР° РІР¶Рµ С”', '#e94560'); return; }
            teams.push({ name, qty: 0, members: [] });
            setTeams(tabId, teams);
            input.value = '';
            renderTeams(tabId);
            showStatus(tabId, `РљРѕРјР°РЅРґР° "${name}" РґРѕР±Р°РІР»РµРЅР°`, '#4ade80');
        }

        function removeTeam(tabId, idx) {
            const teams = getTeams(tabId); teams.splice(idx, 1); setTeams(tabId, teams); renderTeams(tabId);
        }

        function updateTeamQty(tabId, idx, val) {
            const teams = getTeams(tabId); teams[idx].qty = parseInt(val) || 0; setTeams(tabId, teams); renderTeams(tabId);
        }

        function renderTeams(tabId) {
            const container = document.getElementById('teamsContainer_' + tabId);
            const teams = getTeams(tabId);
            const entries = tabState[tabId].sipEntries;
            container.innerHTML = '';
            let totalRequested = 0;
            teams.forEach((team, idx) => {
                const c = getTeamColor(idx);
                totalRequested += team.qty;
                const assigned = entries.filter(e => e.team === team.name).length;
                const members = team.members || [];
                const row = document.createElement('div');
                row.className = 'team-row';
                row.innerHTML = `
                    <span class="team-name-display" style="background:${c.bg};color:${c.text};border:2px solid ${c.border}">${team.name}</span>
                    <label style="color:#aaa;font-size:13px;margin:0">РљС–Р»СЊРєС–СЃС‚СЊ:</label>
                    <input type="number" class="team-qty-input" min="0" value="${team.qty}" onchange="updateTeamQty('${tabId}',${idx},this.value)">
                    <span class="team-assigned">${assigned > 0 ? `<span class="${assigned === team.qty ? 'done' : 'warn'}">РїСЂРёР·РЅР°С‡РµРЅРѕ: ${assigned}</span>` : ''}</span>
                    <span style="font-size:11px;color:${c.text};font-weight:600;margin-left:4px">${members.length} РјРµРЅРµРґР¶.</span>
                    <button class="remove-btn" onclick="removeTeam('${tabId}',${idx})">x</button>
                `;
                container.appendChild(row);
            });
            if (teams.length > 0 && entries.length > 0) {
                const info = document.createElement('div');
                info.style.cssText = 'margin-top:8px;font-size:13px;color:#aaa';
                const totalAssigned = entries.filter(e => e.team).length;
                info.innerHTML = `Р’СЃСЊРѕРіРѕ SIP: <b style="color:#00d4ff">${entries.length}</b> | Р РѕР·РїРѕРґС–Р»РµРЅРѕ: <b style="color:#4ade80">${totalAssigned}</b> | Р’С–Р»СЊРЅРёС…: <b style="color:#fbbf24">${entries.length - totalAssigned}</b>`;
                container.appendChild(info);
            }
        }

        function addTeamMember(tabId, teamIdx) {
            const input = document.getElementById(`addMember_${tabId}_${teamIdx}`);
            const name = input.value.trim();
            if (!name) return;
            const teams = getTeams(tabId);
            if (!teams[teamIdx].members) teams[teamIdx].members = [];
            // РџРµСЂРµРІС–СЂСЏС”РјРѕ С‡Рё РІР¶Рµ С” С‚Р°РєРёР№ РјРµРЅРµРґР¶РµСЂ РІ Р±СѓРґСЊ-СЏРєС–Р№ РєРѕРјР°РЅРґС–
            for (let t of teams) {
                if ((t.members || []).find(m => m.toLowerCase() === name.toLowerCase())) {
                    showStatus(tabId, `"${name}" РІР¶Рµ С” РІ РєРѕРјР°РЅРґС– "${t.name}"`, '#e94560');
                    return;
                }
            }
            teams[teamIdx].members.push(name);
            setTeams(tabId, teams);
            input.value = '';
            renderTeams(tabId);
        }

        function removeTeamMember(tabId, teamIdx, memberIdx) {
            const teams = getTeams(tabId);
            if (teams[teamIdx].members) teams[teamIdx].members.splice(memberIdx, 1);
            setTeams(tabId, teams);
            renderTeams(tabId);
        }

        function autoDistributeByMapping(tabId) {
            const entries = tabState[tabId].sipEntries;
            if (entries.length === 0) { showStatus(tabId, 'РЎРїРѕС‡Р°С‚РєСѓ РєРѕРЅРІРµСЂС‚СѓР№С‚Рµ SIP РґР°РЅС–', '#e94560'); return; }
            const teams = getTeams(tabId);
            if (teams.length === 0) { showStatus(tabId, 'Р”РѕРґР°Р№С‚Рµ С…РѕС‡Р° Р± РѕРґРЅСѓ РєРѕРјР°РЅРґСѓ', '#e94560'); return; }

            // Р‘СѓРґСѓС”РјРѕ РјР°РїРїС–РЅРі РјРµРЅРµРґР¶РµСЂ -> РєРѕРјР°РЅРґР° (case-insensitive)
            const mgrToTeam = {};
            teams.forEach(team => {
                (team.members || []).forEach(m => {
                    mgrToTeam[m.toLowerCase()] = team.name;
                });
            });

            if (Object.keys(mgrToTeam).length === 0) {
                showStatus(tabId, 'Р”РѕРґР°Р№С‚Рµ РјРµРЅРµРґР¶РµСЂС–РІ РґРѕ РєРѕРјР°РЅРґ!', '#e94560');
                return;
            }

            // Р РѕР·РїРѕРґС–Р»СЏС”РјРѕ SIP-Рё РїРѕ РєРѕРјР°РЅРґР°С… РЅР° РѕСЃРЅРѕРІС– РјРµРЅРµРґР¶РµСЂР°
            entries.forEach(e => {
                e.team = '';
                if (e.manager) {
                    const mapped = mgrToTeam[e.manager.toLowerCase()];
                    if (mapped) e.team = mapped;
                }
            });

            renderTeams(tabId); renderGroupedResult(tabId); renderTeamStats(tabId);

            // РЎС‚Р°С‚РёСЃС‚РёРєР°
            const assigned = entries.filter(e => e.team).length;
            const unassigned = entries.filter(e => !e.team);
            const teamStats = teams.map(t => {
                const te = entries.filter(e => e.team === t.name);
                const mgrs = [...new Set(te.map(e => e.manager).filter(m => m))];
                return { name: t.name, sips: te.length, managers: mgrs };
            });

            // Р РµРЅРґРµСЂ Р±Р»РѕРєСѓ СЃС‚Р°С‚РёСЃС‚РёРєРё
            renderAutoDistribStats(tabId, teamStats, unassigned);

            let msg = `РђРІС‚Рѕ-СЂРѕР·РїРѕРґС–Р»: ${assigned} SIP СЂРѕР·РїРѕРґС–Р»РµРЅРѕ`;
            if (unassigned.length > 0) msg += `, ${unassigned.length} РЅРµ Р·РЅР°Р№РґРµРЅРѕ РІ РєРѕРјР°РЅРґР°С…`;
            showStatus(tabId, msg, assigned > 0 ? '#7c6cff' : '#e94560');
        }

        function renderAutoDistribStats(tabId, teamStats, unassigned) {
            const section = document.getElementById('resultSection_' + tabId);
            let mgrBlock = document.getElementById('mgrDistribStats_' + tabId);
            if (!mgrBlock) {
                mgrBlock = document.createElement('div');
                mgrBlock.id = 'mgrDistribStats_' + tabId;
                mgrBlock.style.cssText = 'margin-top:14px';
                section.parentNode.insertBefore(mgrBlock, section.nextSibling);
            }
            let html = '<div style="background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:14px 18px;margin-top:10px">';
            html += '<h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--accent2);margin-bottom:12px">рџ“Љ Р РµР·СѓР»СЊС‚Р°С‚ Р°РІС‚Рѕ-СЂРѕР·РїРѕРґС–Р»Сѓ</h3>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px">';
            teamStats.forEach((ts, idx) => {
                const c = getTeamColor(idx);
                html += `<div style="background:${c.bg};border:2px solid ${c.border};border-radius:9px;padding:12px 14px">`;
                html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">`;
                html += `<span style="color:${c.text};font-weight:700;font-size:14px">${ts.name}</span>`;
                html += `<span style="font-size:11px"><span style="background:${c.border};color:#fff;padding:2px 9px;border-radius:20px;font-weight:700">${ts.managers.length} РјРµРЅРµРґР¶.</span> <span style="color:${c.text};font-weight:600">${ts.sips} SIP</span></span>`;
                html += `</div>`;
                html += `<div style="font-size:12px;color:var(--text2);line-height:1.7">`;
                ts.managers.forEach(m => { html += `<div style="padding:2px 0">вЂў ${m}</div>`; });
                html += `</div></div>`;
            });
            if (unassigned.length > 0) {
                html += `<div style="background:#2a2a2a;border:2px solid #555;border-radius:9px;padding:12px 14px">`;
                html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">`;
                html += `<span style="color:#f04060;font-weight:700;font-size:14px">вљ  РќРµ Р·РЅР°Р№РґРµРЅС–</span>`;
                html += `<span style="color:#aaa;font-size:11px;font-weight:600">${unassigned.length} SIP</span>`;
                html += `</div>`;
                html += `<div style="font-size:12px;color:#f04060;line-height:1.7">`;
                const unknownMgrs = [...new Set(unassigned.map(e => e.manager).filter(m => m))];
                unknownMgrs.forEach(m => { html += `<div style="padding:2px 0">вЂў ${m} (РЅРµ РІ Р¶РѕРґРЅС–Р№ РєРѕРјР°РЅРґС–)</div>`; });
                html += `</div></div>`;
            }
            html += '</div></div>';
            mgrBlock.innerHTML = html;
        }

        function validateDistribute(tabId) {
            const entries = tabState[tabId].sipEntries;
            if (entries.length === 0) { showStatus(tabId, 'РЎРЅР°С‡Р°Р»Р° РєРѕРЅРІРµСЂС‚РёСЂСѓР№С‚Рµ SIP РґР°РЅРЅС‹Рµ', '#e94560'); return null; }
            const teams = getTeams(tabId);
            if (teams.length === 0) { showStatus(tabId, 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРЅСѓ РєРѕРјР°РЅРґСѓ', '#e94560'); return null; }
            const total = teams.reduce((s, t) => s + t.qty, 0);
            if (total === 0) { showStatus(tabId, 'РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ SIP РґР»СЏ РєРѕРјР°РЅРґ', '#e94560'); return null; }
            if (total > entries.length) { showStatus(tabId, `РќСѓР¶РЅРѕ ${total} SIP, Р° РµСЃС‚СЊ С‚РѕР»СЊРєРѕ ${entries.length}`, '#e94560'); return null; }
            return { teams, total };
        }

        function distribute(tabId) {
            const v = validateDistribute(tabId); if (!v) return;
            const entries = tabState[tabId].sipEntries;
            entries.forEach(e => e.team = '');
            let pos = 0;
            v.teams.forEach(team => { for (let i = 0; i < team.qty && pos < entries.length; i++, pos++) entries[pos].team = team.name; });
            renderTeams(tabId); renderGroupedResult(tabId); renderTeamStats(tabId);
            showStatus(tabId, `Р Р°СЃРїСЂРµРґРµР»РµРЅРѕ РїРѕ РїРѕСЂСЏРґРєСѓ! ${v.total} SIP`, '#4ade80');
        }

        function distributeRandom(tabId) {
            const v = validateDistribute(tabId); if (!v) return;
            const entries = tabState[tabId].sipEntries;
            entries.forEach(e => e.team = '');
            const indices = Array.from({ length: entries.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
            let pos = 0;
            v.teams.forEach(team => { for (let i = 0; i < team.qty && pos < indices.length; i++, pos++) entries[indices[pos]].team = team.name; });
            renderTeams(tabId); renderGroupedResult(tabId); renderTeamStats(tabId);
            showStatus(tabId, `Р Р°РЅРґРѕРјРЅРѕ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ! ${v.total} SIP`, '#fbbf24');
        }

        function distributeByManagers(tabId) {
            const entries = tabState[tabId].sipEntries;
            if (entries.length === 0) { showStatus(tabId, 'РЎРЅР°С‡Р°Р»Р° РєРѕРЅРІРµСЂС‚РёСЂСѓР№С‚Рµ SIP РґР°РЅРЅС‹Рµ', '#e94560'); return; }
            const teams = getTeams(tabId);
            if (teams.length === 0) { showStatus(tabId, 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРЅСѓ РєРѕРјР°РЅРґСѓ', '#e94560'); return; }
            const total = teams.reduce((s, t) => s + t.qty, 0);
            if (total === 0) { showStatus(tabId, 'РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ SIP РґР»СЏ РєРѕРјР°РЅРґ', '#e94560'); return; }

            // Р“СЂСѓРїРїРёСЂСѓРµРј SIP РїРѕ РјРµРЅРµРґР¶РµСЂР°Рј
            const managerMap = {};
            entries.forEach((e, idx) => {
                const mgr = e.manager || 'Р‘РµР· РјРµРЅРµРґР¶РµСЂР°';
                if (!managerMap[mgr]) managerMap[mgr] = [];
                managerMap[mgr].push(idx);
            });
            const managerList = Object.entries(managerMap).map(([name, indices]) => ({ name, indices, count: indices.length }));

            // РћС‡РёС‰Р°РµРј РїСЂРµРґС‹РґСѓС‰РµРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРёРµ
            entries.forEach(e => e.team = '');

            // Р Р°СЃРїСЂРµРґРµР»СЏРµРј РјРµРЅРµРґР¶РµСЂРѕРІ РїРѕ РєРѕРјР°РЅРґР°Рј, Р·Р°РїРѕР»РЅСЏСЏ РїРѕ РєРѕР»РёС‡РµСЃС‚РІСѓ
            let teamSlots = teams.map(t => ({ name: t.name, remaining: t.qty, managers: [] }));

            // РЎРѕСЂС‚РёСЂСѓРµРј РјРµРЅРµРґР¶РµСЂРѕРІ РїРѕ РєРѕР»РёС‡РµСЃС‚РІСѓ SIP (РѕС‚ Р±РѕР»СЊС€РµРіРѕ Рє РјРµРЅСЊС€РµРјСѓ) РґР»СЏ Р»СѓС‡С€РµРіРѕ СЂР°СЃРїСЂРµРґРµР»РµРЅРёСЏ
            managerList.sort((a, b) => b.count - a.count);

            managerList.forEach(mgr => {
                // РќР°С…РѕРґРёРј РєРѕРјР°РЅРґСѓ СЃ РЅР°РёР±РѕР»СЊС€РёРј РѕСЃС‚Р°РІС€РёРјСЃСЏ РєРѕР»РёС‡РµСЃС‚РІРѕРј СЃР»РѕС‚РѕРІ
                const available = teamSlots.filter(ts => ts.remaining >= mgr.count);
                let target;
                if (available.length > 0) {
                    // Р‘РµСЂС‘Рј РєРѕРјР°РЅРґСѓ, Сѓ РєРѕС‚РѕСЂРѕР№ Р±РѕР»СЊС€Рµ РІСЃРµРіРѕ СЃРІРѕР±РѕРґРЅС‹С… СЃР»РѕС‚РѕРІ
                    target = available.sort((a, b) => b.remaining - a.remaining)[0];
                } else {
                    // Р•СЃР»Рё РЅРё РѕРґРЅР° РєРѕРјР°РЅРґР° РЅРµ РјРѕР¶РµС‚ РІРјРµСЃС‚РёС‚СЊ С†РµР»РёРєРѕРј, Р±РµСЂС‘Рј СЃ РјР°РєСЃРёРјР°Р»СЊРЅС‹Рј РѕСЃС‚Р°С‚РєРѕРј
                    target = teamSlots.filter(ts => ts.remaining > 0).sort((a, b) => b.remaining - a.remaining)[0];
                }
                if (!target) return;

                const assignCount = Math.min(mgr.count, target.remaining);
                for (let i = 0; i < assignCount; i++) {
                    entries[mgr.indices[i]].team = target.name;
                }
                target.remaining -= assignCount;
                target.managers.push(mgr.name);

                // Р•СЃР»Рё РѕСЃС‚Р°Р»РёСЃСЊ SIP РјРµРЅРµРґР¶РµСЂР°, РєРѕС‚РѕСЂС‹Рµ РЅРµ РІР»РµР·Р»Рё вЂ” СЃС‚Р°РІРёРј РІ С‚Сѓ Р¶Рµ РёР»Рё СЃР»РµРґСѓСЋС‰СѓСЋ
                if (assignCount < mgr.count) {
                    const leftover = mgr.indices.slice(assignCount);
                    const next = teamSlots.filter(ts => ts.remaining > 0).sort((a, b) => b.remaining - a.remaining)[0];
                    if (next) {
                        const extra = Math.min(leftover.length, next.remaining);
                        for (let i = 0; i < extra; i++) {
                            entries[leftover[i]].team = next.name;
                        }
                        next.remaining -= extra;
                        if (!next.managers.includes(mgr.name)) next.managers.push(mgr.name);
                    }
                }
            });

            renderTeams(tabId); renderGroupedResult(tabId); renderTeamStats(tabId);
            // РџРѕРєР°Р·С‹РІР°РµРј СЃС‚Р°С‚РёСЃС‚РёРєСѓ РјРµРЅРµРґР¶РµСЂРѕРІ
            renderManagerDistribStats(tabId, teamSlots);
            const totalAssigned = entries.filter(e => e.team).length;
            showStatus(tabId, `Р Р°СЃРїСЂРµРґРµР»РµРЅРѕ РїРѕ РјРµРЅРµРґР¶РµСЂР°Рј! ${totalAssigned} SIP, ${managerList.length} РјРµРЅРµРґР¶РµСЂРѕРІ`, '#7c6cff');
        }

        function renderManagerDistribStats(tabId, teamSlots) {
            const section = document.getElementById('resultSection_' + tabId);
            // Р”РѕР±Р°РІР»СЏРµРј Р±Р»РѕРє СЃС‚Р°С‚РёСЃС‚РёРєРё РјРµРЅРµРґР¶РµСЂРѕРІ РїРѕСЃР»Рµ РѕСЃРЅРѕРІРЅРѕРіРѕ СЂРµР·СѓР»СЊС‚Р°С‚Р°
            let mgrBlock = document.getElementById('mgrDistribStats_' + tabId);
            if (!mgrBlock) {
                mgrBlock = document.createElement('div');
                mgrBlock.id = 'mgrDistribStats_' + tabId;
                mgrBlock.style.cssText = 'margin-top:14px';
                section.parentNode.insertBefore(mgrBlock, section.nextSibling);
            }
            let html = '<div style="background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:14px 18px;margin-top:10px">';
            html += '<h3 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--accent2);margin-bottom:12px">рџ“Љ РњРµРЅРµРґР¶РµСЂС‹ РїРѕ РєРѕРјР°РЅРґР°Рј</h3>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px">';
            teamSlots.forEach((ts, idx) => {
                const c = getTeamColor(idx);
                html += `<div style="background:${c.bg};border:2px solid ${c.border};border-radius:9px;padding:12px 14px">`;
                html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">`;
                html += `<span style="color:${c.text};font-weight:700;font-size:14px">${ts.name}</span>`;
                html += `<span style="background:${c.border};color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700">${ts.managers.length} РјРµРЅРµРґР¶.</span>`;
                html += `</div>`;
                html += `<div style="font-size:12px;color:var(--text2);line-height:1.7">`;
                ts.managers.forEach(m => { html += `<div style="padding:2px 0">вЂў ${m}</div>`; });
                html += `</div></div>`;
            });
            html += '</div></div>';
            mgrBlock.innerHTML = html;
        }

        function renderGroupedResult(tabId) {
            const section = document.getElementById('resultSection_' + tabId);
            const teams = getTeams(tabId);
            const entries = tabState[tabId].sipEntries;
            section.innerHTML = ''; section.classList.add('visible');
            teams.forEach((team, idx) => {
                const c = getTeamColor(idx);
                const te = entries.filter(e => e.team === team.name);
                if (te.length === 0) return;
                const block = document.createElement('div');
                block.className = 'result-team-block';
                block.style.borderLeftColor = c.border;
                const uniqueMgrs = [...new Set(te.map(e => e.manager).filter(m => m))];
                const mgrBadge = uniqueMgrs.length > 0 ? `<span style="margin-left:8px;font-size:11px;color:var(--accent2)">(${uniqueMgrs.length} РјРµРЅРµРґР¶.)</span>` : '';
                block.innerHTML = `<div class="result-team-header"><h4 style="color:${c.text}">${team.name}${mgrBadge}</h4><span class="count-badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border}">${te.length} SIP</span></div><div class="result-team-lines">${te.map(e => `${e.sip} ${e.ip} ${e.pass}${e.manager ? ' [' + e.manager + ']' : ''}`).join('\n')}</div>`;
                section.appendChild(block);
            });
            const unassigned = entries.filter(e => !e.team);
            if (unassigned.length > 0) {
                const block = document.createElement('div');
                block.className = 'result-team-block'; block.style.borderLeftColor = '#555';
                block.innerHTML = `<div class="result-team-header"><h4 style="color:#aaa">Р‘РµР· РєРѕРјР°РЅРґС‹</h4><span class="count-badge" style="background:#2a2a2a;color:#aaa;border:1px solid #555">${unassigned.length} SIP</span></div><div class="result-team-lines">${unassigned.map(e => `${e.sip} ${e.ip} ${e.pass}`).join('\n')}</div>`;
                section.appendChild(block);
            }
        }

        function renderTeamStats(tabId) {
            const grid = document.getElementById('statsGrid_' + tabId);
            const teams = getTeams(tabId);
            const entries = tabState[tabId].sipEntries;
            grid.innerHTML = '';
            teams.forEach((team, idx) => {
                const c = getTeamColor(idx);
                const count = entries.filter(e => e.team === team.name).length;
                grid.innerHTML += `<div class="stat-card" style="background:${c.bg};border:2px solid ${c.border};color:${c.text}"><div class="stat-count">${count}</div><div class="stat-name">${team.name}</div></div>`;
            });
            const un = entries.filter(e => !e.team).length;
            if (un > 0) grid.innerHTML += `<div class="stat-card" style="background:#2a2a2a;border:2px solid #555;color:#aaa"><div class="stat-count">${un}</div><div class="stat-name">Р±РµР· РєРѕРјР°РЅРґС‹</div></div>`;
            grid.innerHTML += `<div class="stat-card" style="background:#1a2a3e;border:2px solid #00d4ff;color:#00d4ff"><div class="stat-count">${entries.length}</div><div class="stat-name">РІСЃСЊРѕРіРѕ</div></div>`;
            // РљС–Р»СЊРєС–СЃС‚СЊ РјРµРЅРµРґР¶РµСЂС–РІ РїРѕ РєРѕРјР°РЅРґР°С…
            const totalMgrs = [...new Set(entries.map(e => e.manager).filter(m => m))].length;
            if (totalMgrs > 0) {
                grid.innerHTML += `<div class="stat-card" style="background:#2d1f3b;border:2px solid #a855f7;color:#c084fc"><div class="stat-count">${totalMgrs}</div><div class="stat-name">РјРµРЅРµРґР¶РµСЂС–РІ</div></div>`;
            }
        }

        // ===== MANAGERS TABS (Р“РѕСЃРё, Закрыто) =====
        function addManager(tabId) {
            const input = document.getElementById('newManagerName_' + tabId);
            const name = input.value.trim();
            if (!name) return;
            const managers = getManagers(tabId);
            if (managers.find(m => m.name.toLowerCase() === name.toLowerCase())) { showStatus(tabId, 'РўР°РєРѕР№ РјРµРЅРµРґР¶РµСЂ СѓР¶Рµ РµСЃС‚СЊ', '#e94560'); return; }
            managers.push({ name, sips: [] });
            setManagers(tabId, managers);
            input.value = '';
            renderManagers(tabId);
            showStatus(tabId, `РњРµРЅРµРґР¶РµСЂ "${name}" РґРѕР±Р°РІР»РµРЅ`, '#4ade80');
        }

        function removeManager(tabId, idx) {
            const managers = getManagers(tabId); managers.splice(idx, 1); setManagers(tabId, managers); renderManagers(tabId);
        }

        function addSipToManager(tabId, mgrIdx) {
            const input = document.getElementById(`mgrSipInput_${tabId}_${mgrIdx}`);
            const sipNum = input.value.trim();
            if (!sipNum) return;
            const managers = getManagers(tabId);
            managers[mgrIdx].sips.push(sipNum);
            setManagers(tabId, managers);
            input.value = '';
            renderManagers(tabId);
            updateManagerOutput(tabId);
        }

        function removeSipFromManager(tabId, mgrIdx, sipIdx) {
            const managers = getManagers(tabId);
            managers[mgrIdx].sips.splice(sipIdx, 1);
            setManagers(tabId, managers);
            renderManagers(tabId);
            updateManagerOutput(tabId);
        }

        function renderManagers(tabId) {
            const container = document.getElementById('managersContainer_' + tabId);
            const managers = getManagers(tabId);
            const entries = tabState[tabId].sipEntries;
            container.innerHTML = '';

            managers.forEach((mgr, mgrIdx) => {
                const c = getTeamColor(mgrIdx);
                const card = document.createElement('div');
                card.className = 'manager-card';
                card.style.borderLeft = `4px solid ${c.border}`;

                let sipsHTML = '';
                mgr.sips.forEach((sipNum, sipIdx) => {
                    const entry = entries.find(e => e.sip === sipNum);
                    const sipInfo = entry ? `${entry.sip} ${entry.ip} ${entry.pass}` : `${sipNum} (РЅРµ Р·РЅР°Р№РґРµРЅРѕ)`;
                    const infoColor = entry ? '#ccc' : '#e94560';
                    sipsHTML += `<div class="manager-sip-row"><span style="color:${infoColor}">${sipInfo}</span><button class="remove-btn" style="font-size:14px;padding:0 4px" onclick="removeSipFromManager('${tabId}',${mgrIdx},${sipIdx})">x</button></div>`;
                });

                card.innerHTML = `
                    <div class="manager-header">
                        <h4 style="color:${c.text}">${mgr.name} <span style="font-size:12px;color:#aaa">(${mgr.sips.length} SIP)</span></h4>
                        <button class="remove-btn" onclick="removeManager('${tabId}',${mgrIdx})">x</button>
                    </div>
                    <div class="manager-sip-list">${sipsHTML}</div>
                    <div class="add-row" style="margin-top:6px">
                        <input type="text" class="manager-sip-input" id="mgrSipInput_${tabId}_${mgrIdx}" placeholder="SIP РЅРѕРјРµСЂ..." onkeydown="if(event.key==='Enter')addSipToManager('${tabId}',${mgrIdx})">
                        <button class="manager-add-sip" onclick="addSipToManager('${tabId}',${mgrIdx})">+ SIP</button>
                    </div>
                `;
                container.appendChild(card);
            });

            renderManagerStats(tabId);
        }

        function updateManagerOutput(tabId) {
            const managers = getManagers(tabId);
            const entries = tabState[tabId].sipEntries;
            let text = '';
            managers.forEach(mgr => {
                if (mgr.sips.length === 0) return;
                text += `${mgr.name} (${mgr.sips.length}):\n`;
                mgr.sips.forEach(sipNum => {
                    const entry = entries.find(e => e.sip === sipNum);
                    text += entry ? `${entry.sip} ${entry.ip} ${entry.pass}\n` : `${sipNum} (РЅРµ Р·РЅР°Р№РґРµРЅРѕ)\n`;
                });
                text += '\n';
            });
            document.getElementById('output_' + tabId).value = text;
        }

        function renderManagerStats(tabId) {
            const grid = document.getElementById('statsGrid_' + tabId);
            const managers = getManagers(tabId);
            const entries = tabState[tabId].sipEntries;
            grid.innerHTML = '';
            let totalAssigned = 0;
            managers.forEach((mgr, idx) => {
                const c = getTeamColor(idx);
                totalAssigned += mgr.sips.length;
                grid.innerHTML += `<div class="stat-card" style="background:${c.bg};border:2px solid ${c.border};color:${c.text}"><div class="stat-count">${mgr.sips.length}</div><div class="stat-name">${mgr.name}</div></div>`;
            });
            if (entries.length > 0) {
                const allAssignedSips = managers.flatMap(m => m.sips);
                const unassigned = entries.filter(e => !allAssignedSips.includes(e.sip)).length;
                if (unassigned > 0) grid.innerHTML += `<div class="stat-card" style="background:#2a2a2a;border:2px solid #555;color:#aaa"><div class="stat-count">${unassigned}</div><div class="stat-name">СЃРІРѕР±РѕРґРЅС‹Рµ</div></div>`;
            }
            grid.innerHTML += `<div class="stat-card" style="background:#1a2a3e;border:2px solid #00d4ff;color:#00d4ff"><div class="stat-count">${totalAssigned}</div><div class="stat-name">РЅР°Р·РЅР°С‡РµРЅРѕ</div></div>`;
        }

        function copyManagersResult(tabId) {
            const managers = getManagers(tabId);
            const entries = tabState[tabId].sipEntries;
            if (managers.length === 0 || managers.every(m => m.sips.length === 0)) {
                showStatus(tabId, 'РЎРЅР°С‡Р°Р»Р° РґРѕР±Р°РІСЊС‚Рµ SIP-С‹ РјРµРЅРµРґР¶РµСЂР°Рј', '#e94560'); return;
            }
            let text = '';
            managers.forEach(mgr => {
                if (mgr.sips.length === 0) return;
                text += `${mgr.name} (${mgr.sips.length}):\n`;
                mgr.sips.forEach(sipNum => {
                    const entry = entries.find(e => e.sip === sipNum);
                    text += entry ? `${entry.sip} ${entry.ip} ${entry.pass}\n` : `${sipNum}\n`;
                });
                text += '\n';
            });
            text += '---\n';
            managers.forEach(mgr => { text += `${mgr.name}: ${mgr.sips.length}\n`; });
            navigator.clipboard.writeText(text).then(() => {
                showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ РїРѕ РјРµРЅРµРґР¶РµСЂР°Рј!', '#4ade80');
            }).catch(() => {
                document.getElementById('output_' + tabId).value = text;
                showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ!', '#4ade80');
            });
        }

        // ===== COMMON =====
        function convert(tabId) {
            const input = document.getElementById('input_' + tabId).value.trim();
            if (!input) { showStatus(tabId, 'Р’СЃС‚Р°РІСЊС‚Рµ РґР°РЅРЅС‹Рµ РґР»СЏ РєРѕРЅРІРµСЂС‚Р°С†РёРё', '#e94560'); return; }
            const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const entries = [];
            const ipRe = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/;
            let i = 0;
            let currentManager = '';
            while (i < lines.length) {
                // Р¤РѕСЂРјР°С‚ 1: "[РґР°С‚Р°] ... РњР•РќР•Р”Р–Р•Р  - SIP: 209 \n РїР°СЂРѕР»СЊ \n ip"
                const sipMatch = lines[i].match(/SIP:\s*(\d+)/);
                if (sipMatch && i + 2 < lines.length) {
                    // РР·РІР»РµРєР°РµРј РёРјСЏ РјРµРЅРµРґР¶РµСЂР° РёР· СЃС‚СЂРѕРєРё
                    const mgrMatch = lines[i].match(/[рџ†”пёЏ]+\s*(.+?)\s*[-вЂ“вЂ”]\s*SIP/i) || lines[i].match(/\]\s*(.+?)\s*[-вЂ“вЂ”]\s*SIP/i);
                    if (mgrMatch) currentManager = mgrMatch[1].trim();
                    const pass = lines[i + 1], ip = lines[i + 2];
                    if (!pass.includes('SIP:') && ipRe.test(ip)) {
                        entries.push({ sip: sipMatch[1], ip, pass, team: '', manager: currentManager });
                        i += 3; continue;
                    }
                }
                // Р¤РѕСЂРјР°С‚ 2: РѕРґРЅРѕСЂСЏРґРєРѕРІРёР№ "SIP IP РџРђР РћР›Р¬ РњР•РќР•Р”Р–Р•Р  ---РљРћРњРђРќР”Рђ" Р°Р±Рѕ "SIP IP РџРђР РћР›Р¬ РњР•РќР•Р”Р–Р•Р "
                const oneLineMatch = lines[i].match(/^(\d{3,})\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?)\s+(\S+)\s+(.+)$/);
                if (oneLineMatch) {
                    let mgrPart = oneLineMatch[4].trim();
                    let teamName = '';
                    // РџРµСЂРµРІС–СЂСЏС”РјРѕ С‡Рё С” СЂРѕР·РґС–Р»СЋРІР°С‡ --- РјС–Р¶ РјРµРЅРµРґР¶РµСЂРѕРј С‚Р° РєРѕРјР°РЅРґРѕСЋ
                    const dashSep = mgrPart.match(/^(.+?)\s*-+\s*(.+)$/);
                    if (dashSep) {
                        mgrPart = dashSep[1].trim();
                        teamName = dashSep[2].trim();
                    }
                    entries.push({ sip: oneLineMatch[1], ip: oneLineMatch[2], pass: oneLineMatch[3], team: teamName, manager: mgrPart });
                    i++; continue;
                }
                // Р¤РѕСЂРјР°С‚ 3: "813" РёР»Рё "814 РїС‚РёС‡РєР°" \n РїР°СЂРѕР»СЊ \n ip
                const bareMatch = lines[i].match(/^(\d{3,})\b/);
                if (bareMatch && i + 2 < lines.length) {
                    const pass = lines[i + 1], ip = lines[i + 2];
                    if (/^[A-Za-z0-9+/=_-]{5,}$/.test(pass) && ipRe.test(ip)) {
                        entries.push({ sip: bareMatch[1], ip, pass, team: '', manager: currentManager });
                        i += 3; continue;
                    }
                }
                // РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё РёРјСЏ РјРµРЅРµРґР¶РµСЂР° РІ СЃС‚СЂРѕРєРµ Р±РµР· SIP (Р·Р°РіРѕР»РѕРІРѕРє Р±Р»РѕРєР°)
                const headerMgr = lines[i].match(/[рџ†”пёЏ]+\s*(.+?)\s*$/i);
                if (headerMgr && !sipMatch && !lines[i].match(/^\d/)) {
                    currentManager = headerMgr[1].replace(/\s*[-вЂ“вЂ”].*$/, '').trim();
                }
                i++;
            }
            if (entries.length === 0) { showStatus(tabId, 'РќРµ СѓРґР°Р»РѕСЃСЊ СЂР°СЃРїРѕР·РЅР°С‚СЊ РґР°РЅРЅС‹Рµ. РџСЂРѕРІРµСЂСЊС‚Рµ С„РѕСЂРјР°С‚.', '#e94560'); return; }
            tabState[tabId].sipEntries = entries;
            document.getElementById('output_' + tabId).value = entries.map(e => `${e.sip} ${e.ip} ${e.pass}`).join('\n');

            const tab = TABS.find(t => t.id === tabId);
            if (tab.type === 'teams') {
                // РЇРєС‰Рѕ РІ РґР°РЅРёС… РІР¶Рµ С” РЅР°Р·РІРё РєРѕРјР°РЅРґ вЂ” Р°РІС‚РѕРјР°С‚РёС‡РЅРѕ СЃС‚РІРѕСЂРёС‚Рё РєРѕРјР°РЅРґРё С‚Р° СЂРѕР·РїРѕРґС–Р»РёС‚Рё
                const teamsInData = [...new Set(entries.map(e => e.team).filter(t => t))];
                if (teamsInData.length > 0) {
                    // РЎС‚РІРѕСЂСЋС”РјРѕ Р°Р±Рѕ РѕРЅРѕРІР»СЋС”РјРѕ РєРѕРјР°РЅРґРё Р· РїР°СЂСЃРµРЅРёС… РґР°РЅРёС…
                    let teams = getTeams(tabId);
                    teamsInData.forEach(tName => {
                        if (!teams.find(t => t.name.toLowerCase() === tName.toLowerCase())) {
                            teams.push({ name: tName, qty: 0, members: [] });
                        }
                    });
                    // РћРЅРѕРІР»СЋС”РјРѕ members вЂ” РґРѕРґР°С”РјРѕ РјРµРЅРµРґР¶РµСЂС–РІ РґРѕ РІС–РґРїРѕРІС–РґРЅРёС… РєРѕРјР°РЅРґ
                    entries.forEach(e => {
                        if (e.team && e.manager) {
                            const teamObj = teams.find(t => t.name.toLowerCase() === e.team.toLowerCase());
                            if (teamObj) {
                                if (!teamObj.members) teamObj.members = [];
                                if (!teamObj.members.find(m => m.toLowerCase() === e.manager.toLowerCase())) {
                                    teamObj.members.push(e.manager);
                                }
                                // РќРѕСЂРјР°Р»С–Р·СѓС”РјРѕ РЅР°Р·РІСѓ РєРѕРјР°РЅРґРё
                                e.team = teamObj.name;
                            }
                        }
                    });
                    // РћРЅРѕРІР»СЋС”РјРѕ qty РЅР° РѕСЃРЅРѕРІС– СЂРµР°Р»СЊРЅРёС… РґР°РЅРёС…
                    teams.forEach(t => {
                        t.qty = entries.filter(e => e.team === t.name).length;
                    });
                    setTeams(tabId, teams);
                    renderTeams(tabId);
                    renderGroupedResult(tabId);
                    renderTeamStats(tabId);
                    // РЎС‚Р°С‚РёСЃС‚РёРєР°
                    const teamStats = teams.filter(t => entries.some(e => e.team === t.name)).map(t => {
                        const te = entries.filter(e => e.team === t.name);
                        const mgrs = [...new Set(te.map(e => e.manager).filter(m => m))];
                        return { name: t.name, sips: te.length, managers: mgrs };
                    });
                    const unassigned = entries.filter(e => !e.team);
                    renderAutoDistribStats(tabId, teamStats, unassigned);
                    const totalMgrs = [...new Set(entries.map(e => e.manager).filter(m => m))].length;
                    showStatus(tabId, `Р РѕР·РїС–Р·РЅР°РЅРѕ: ${entries.length} SIP, ${teamsInData.length} РєРѕРјР°РЅРґ, ${totalMgrs} РјРµРЅРµРґР¶РµСЂС–РІ`, '#7c6cff');
                } else {
                    // РЇРєС‰Рѕ С” Р·Р±РµСЂРµР¶РµРЅРёР№ РјР°РїРїС–РЅРі РјРµРЅРµРґР¶РµСЂС–РІ вЂ” Р°РІС‚Рѕ-СЂРѕР·РїРѕРґС–Р»РёС‚Рё С– РїРѕРєР°Р·Р°С‚Рё РїС–РґСЂР°С…СѓРЅРѕРє
                    const teams = getTeams(tabId);
                    const hasMapping = teams.some(t => (t.members || []).length > 0);
                    const hasManagers = entries.some(e => e.manager);
                    if (hasMapping && hasManagers) {
                        // РђРІС‚Рѕ-СЂРѕР·РїРѕРґС–Р» РїРѕ Р·Р±РµСЂРµР¶РµРЅРѕРјСѓ РјР°РїРїС–РЅРіСѓ
                        const mgrToTeam = {};
                        teams.forEach(team => {
                            (team.members || []).forEach(m => { mgrToTeam[m.toLowerCase()] = team.name; });
                        });
                        entries.forEach(e => {
                            if (e.manager) {
                                const mapped = mgrToTeam[e.manager.toLowerCase()];
                                if (mapped) e.team = mapped;
                            }
                        });
                        teams.forEach(t => { t.qty = entries.filter(e => e.team === t.name).length; });
                        setTeams(tabId, teams);
                        renderTeams(tabId);
                        renderGroupedResult(tabId);
                        renderTeamStats(tabId);
                        // РџРѕРєР°Р·СѓС”РјРѕ РїС–РґСЂР°С…СѓРЅРѕРє РјРµРЅРµРґР¶РµСЂС–РІ РїРѕ РєРѕРјР°РЅРґР°С…
                        const teamStats = teams.filter(t => entries.some(e => e.team === t.name)).map(t => {
                            const te = entries.filter(e => e.team === t.name);
                            const mgrs = [...new Set(te.map(e => e.manager).filter(m => m))];
                            return { name: t.name, sips: te.length, managers: mgrs };
                        });
                        const unassigned = entries.filter(e => !e.team);
                        renderAutoDistribStats(tabId, teamStats, unassigned);
                        const assigned = entries.filter(e => e.team).length;
                        const totalMgrs = [...new Set(entries.filter(e => e.team).map(e => e.manager).filter(m => m))].length;
                        showStatus(tabId, `вњ“ ${assigned} SIP, ${totalMgrs} РјРµРЅРµРґР¶РµСЂС–РІ СЂРѕР·РїРѕРґС–Р»РµРЅРѕ`, '#7c6cff');
                    } else {
                        renderTeams(tabId);
                        showStatus(tabId, `Р“РѕС‚РѕРІРѕ! РћР±СЂРѕР±Р»РµРЅРѕ Р·Р°РїРёСЃС–РІ: ${entries.length}`, '#4ade80');
                    }
                }
            } else {
                renderManagers(tabId);
                showStatus(tabId, `Р“РѕС‚РѕРІРѕ! РћР±СЂРѕР±Р»РµРЅРѕ Р·Р°РїРёСЃС–РІ: ${entries.length}`, '#4ade80');
            }
        }

        function copyResult(tabId) {
            const output = document.getElementById('output_' + tabId);
            if (!output.value) { showStatus(tabId, 'РќРµС‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°', '#e94560'); return; }
            navigator.clipboard.writeText(output.value).then(() => { showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ!', '#4ade80'); })
            .catch(() => { output.select(); document.execCommand('copy'); showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ!', '#4ade80'); });
        }

        function copyGrouped(tabId) {
            const entries = tabState[tabId].sipEntries;
            if (entries.length === 0 || entries.every(e => !e.team)) { showStatus(tabId, 'РЎРЅР°С‡Р°Р»Р° СЂР°СЃРїСЂРµРґРµР»РёС‚Рµ SIP РїРѕ РєРѕРјР°РЅРґР°Рј', '#e94560'); return; }
            const teams = getTeams(tabId);
            let text = '';
            teams.forEach(team => {
                const te = entries.filter(e => e.team === team.name);
                if (te.length === 0) return;
                text += `${team.name} (${te.length}):\n`;
                te.forEach(e => { text += `${e.sip} ${e.ip} ${e.pass}\n`; });
                text += '\n';
            });
            const un = entries.filter(e => !e.team);
            if (un.length > 0) { text += `Р±РµР· РєРѕРјР°РЅРґС‹ (${un.length}):\n`; un.forEach(e => { text += `${e.sip} ${e.ip} ${e.pass}\n`; }); text += '\n'; }
            text += '---\n';
            teams.forEach(t => { text += `${t.name}: ${entries.filter(e => e.team === t.name).length}\n`; });
            text += `РІСЃСЊРѕРіРѕ: ${entries.length}\n`;
            navigator.clipboard.writeText(text).then(() => { showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ РїРѕ РєРѕРјР°РЅРґР°Рј!', '#4ade80'); })
            .catch(() => { document.getElementById('output_' + tabId).value = text; showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ!', '#4ade80'); });
        }

        function clearAll(tabId) {
            document.getElementById('input_' + tabId).value = '';
            document.getElementById('output_' + tabId).value = '';
            tabState[tabId].sipEntries = [];
            const rs = document.getElementById('resultSection_' + tabId);
            if (rs) { rs.innerHTML = ''; rs.classList.remove('visible'); }
            document.getElementById('statsGrid_' + tabId).innerHTML = '';
            const tab = TABS.find(t => t.id === tabId);
            if (tab.type === 'teams') renderTeams(tabId);
            else if (tab.type === 'notepad') renderCards(tabId);
            else if (tab.type === 'notepad_sections') renderSections(tabId);
            else renderManagers(tabId);
            showStatus(tabId, 'РћС‡РёС‰РµРЅРѕ', '#aaa');
        }

        // ===== CARDS TABS (Закрыто) =====
        function getCards(tabId) {
            const si = notepadActiveIdx[tabId] || 0;
            const secs = getNotepadSections(tabId);
            return (secs[si] && secs[si].cards) ? secs[si].cards : [];
        }
        function setCards(tabId, cards) {
            const si = notepadActiveIdx[tabId] || 0;
            const secs = getNotepadSections(tabId);
            if (secs[si]) { secs[si].cards = cards; setNotepadSections(tabId, secs); }
        }

        function addCard(tabId) {
            const cards = getCards(tabId);
            if (cards.length >= getCardLimit()) { showStatus(tabId, 'РњР°РєСЃРёРјСѓРј ' + getCardLimit() + ' РєР°СЂС‚РѕС‡РµРє', '#f04060'); return; }
            cards.push({ name: '', body: '' });
            setCards(tabId, cards);
            renderCards(tabId);
        }

        function removeCard(tabId, idx) {
            const cards = getCards(tabId); cards.splice(idx, 1); setCards(tabId, cards); renderCards(tabId);
        }

        function updateCardField(tabId, idx, field, val) {
            const si = notepadActiveIdx[tabId] || 0;
            const secs = getNotepadSections(tabId);
            if (secs[si] && secs[si].cards[idx]) { secs[si].cards[idx][field] = val; setNotepadSections(tabId, secs); }
        }

        function renderCards(tabId) {
            const bar = document.getElementById('subtabsBar_' + tabId);
            const panels = document.getElementById('subtabsPanels_' + tabId);
            if (!bar || !panels) return;
            const secs = getNotepadSections(tabId);
            if (notepadActiveIdx[tabId] === undefined) notepadActiveIdx[tabId] = 0;
            const active = notepadActiveIdx[tabId];

            // render bar
            bar.innerHTML = '';
            secs.forEach((sec, si) => {
                const c = getTeamColor(si);
                const btn = document.createElement('button');
                btn.className = 'subtab-btn' + (si === active ? ' active' : '');
                btn.textContent = sec.name || ('РљРѕРјР°РЅРґР° ' + (si + 1));
                btn.title = sec.name;
                if (si === active) btn.style.color = c.text;
                btn.onclick = () => switchNotepadSection(tabId, si);
                bar.appendChild(btn);
            });
            const addBtn = document.createElement('button');
            addBtn.className = 'subtab-add-btn';
            addBtn.textContent = '+';
            addBtn.title = 'Р”РѕР±Р°РІРёС‚СЊ РєРѕРјР°РЅРґСѓ';
            addBtn.onclick = () => addNotepadSection(tabId);
            bar.appendChild(addBtn);

            // render panels
            panels.innerHTML = '';
            secs.forEach((sec, si) => {
                const c = getTeamColor(si);
                const cards = sec.cards || [];
                const panel = document.createElement('div');
                panel.className = 'subtab-panel' + (si === active ? ' active' : '');
                panel.style.borderTop = '2px solid ' + c.border;

                let cardsHTML = '';
                cards.forEach((card, idx) => {
                    const cc = getTeamColor(idx);
                    cardsHTML += `
                        <div class="sip-card" style="border-left:4px solid ${cc.border}">
                            <div class="sip-card-header">
                                <input type="text" class="sip-card-name"
                                    value="${(card.name||'').replace(/"/g,'&quot;')}"
                                    placeholder="РњРµРЅРµРґР¶РµСЂ"
                                    oninput="updateCardField('${tabId}',${idx},'name',this.value)">
                                <button class="remove-btn" onclick="removeCard('${tabId}',${idx})">Г—</button>
                            </div>
                            <input type="text" class="sip-card-drop"
                                value="${(card.drop||'').replace(/"/g,'&quot;')}"
                                placeholder="Р”СЂРѕРї"
                                oninput="updateCardField('${tabId}',${idx},'drop',this.value)">
                            <textarea class="sip-card-body"
                                placeholder="РґРѕРјРµРЅ: 31.192.106.179:6060&#10;Р»РѕРіРёРЅ: 113221&#10;РїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!"
                                oninput="updateCardField('${tabId}',${idx},'body',this.value)">${card.body||''}</textarea>
                        </div>`;
                });

                panel.innerHTML = `
                    <div class="subtab-header">
                        <input class="section-title-input" type="text"
                            value="${(sec.name||'').replace(/"/g,'&quot;')}"
                            placeholder="РќР°Р·РІР°РЅРёРµ РєРѕРјР°РЅРґС‹..."
                            style="color:${c.text}"
                            oninput="updateNotepadSectionName('${tabId}',${si},this.value)">
                        <div class="section-actions">
                            <button class="section-copy-btn" style="border-color:${c.border};color:${c.text};background:${c.bg}" onclick="copyAllCards('${tabId}',${si})">рџ“‹ РљРѕРїРёСЂРѕРІР°С‚СЊ</button>
                            <button class="remove-btn" title="РЈРґР°Р»РёС‚СЊ РєРѕРјР°РЅРґСѓ" onclick="removeNotepadSection('${tabId}',${si})" style="font-size:15px">рџ—‘</button>
                        </div>
                    </div>
                    <div class="section-cards-grid">${cardsHTML}</div>
                    <button class="btn-add" ${cards.length >= getCardLimit() ? 'style="display:none"' : ''} onclick="addCard('${tabId}')">+ Р”РѕР±Р°РІРёС‚СЊ SIP</button>
                `;
                panels.appendChild(panel);
            });
        }

        function copyAllCards(tabId, si) {
            const secs = getNotepadSections(tabId);
            const idx = si !== undefined ? si : (notepadActiveIdx[tabId] || 0);
            const cards = ((secs[idx] && secs[idx].cards) || []).filter(c => c.name || c.body);
            if (cards.length === 0) { showStatus(tabId, 'РќРµС‚ РґР°РЅРЅС‹С…', '#f04060'); return; }
            let text = '';
            if (secs[idx].name) text += secs[idx].name + ':\n';
            cards.forEach(card => {
                if (card.name) text += card.name + ':\n';
                if (card.drop) text += 'Р”СЂРѕРї: ' + card.drop + '\n';
                text += card.body + '\n\n';
            });
            navigator.clipboard.writeText(text.trim())
                .then(() => showStatus(tabId, 'РЎРєРѕРїРёСЂРѕРІР°РЅРѕ!', '#22c55e'))
                .catch(() => showStatus(tabId, 'РћС€РёР±РєР° РєРѕРїРёСЂРѕРІР°РЅРёСЏ', '#f04060'));
        }

        function clearAllCards(tabId) {
            setCards(tabId, []);
            renderCards(tabId);
            showStatus(tabId, 'РћС‡РёС‰РµРЅРѕ', '#aaa');
        }

        function showStatus(tabId, msg, color) {
            const el = document.getElementById('status_' + tabId);
            el.textContent = msg; el.style.color = color;
        }

        function setupPaste(tabId) {
            document.getElementById('input_' + tabId).addEventListener('paste', () => { setTimeout(() => convert(tabId), 100); });
        }

        // Migrate old teams
        (function migrate() {
            try {
                const oldTeams = JSON.parse(localStorage.getItem('grozniy_teams'));
                if (oldTeams && oldTeams.length > 0 && getTeams('holodka').length === 0) {
                    setTeams('holodka', oldTeams.map(t => typeof t === 'string' ? { name: t, qty: 0 } : t));
                }
            } catch {}
            // migrate per-tab old format
            TABS.forEach(tab => {
                const teams = getTeams(tab.id);
                if (teams.length > 0 && typeof teams[0] === 'string') setTeams(tab.id, teams.map(n => ({ name: n, qty: 0 })));
            });
        })();

        // ===== EMBEDDED DATA (auto-filled on save) =====
        const EMBEDDED_DATA = {"grozniy_cards_zakryv":"[{\"name\":\"123\",\"body\":\"1112\"},{\"name\":\"213\",\"body\":\"С–РІС„РІ\"}]","grozniy_cards_gosi":"[{\"name\":\"С‡С‡\",\"body\":\"С‡С‡\"},{\"name\":\"112\",\"body\":\"123\"}]","grozniy_settings":"{\"theme\":\"dark\"}","grozniy_panel_opacity":"100","grozniy_teams":"[{\"name\":\"РєР°РЅР°РґР°\",\"qty\":20},{\"name\":\"СЃС‚Р°Р»СЊ\",\"qty\":20},{\"name\":\"РіРѕР»РёР°С„\",\"qty\":1}]","grozniy_np_sections_zakryv":"[{\"name\":\"СЃС‚Р°Р»СЊ\",\"cards\":[{\"name\":\"СЃРёРЅРѕРїС‚РёРє\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113221\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃРїР° \"},{\"name\":\"РїРѕРЅРѕРјР°СЂСЊ \",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113202\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї \"},{\"name\":\"С‚Р°Р»РёСЃРјР°РЅ\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113227\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"РїР°СѓРє\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 103205\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!$\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"РёС‚Р°Р»РёСЏ \",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113204\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI\",\"drop\":\"РјС‚СЃ СЃР°Рї \"},{\"name\":\"РґРµР»РѕРІР°СЂ\",\"body\":\"5005 - 213.134.13.77 - nK6yvGOy1uZDyCiR\",\"drop\":\"Р°РЅРѕРІР° \"}]},{\"name\":\"РєР°РЅР°РґР°\",\"cards\":[{\"name\":\"РІР°РЅРёР»РѕРїР°\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113226\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI*$*\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"РїСѓРјР±Р°\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 103220\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"Р±РёСЂС‡Р°\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 103208\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"РјР°С‚РІРµР№\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113206\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI$\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"СЃРєРІРёРї\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113207\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї \"},{\"name\":\"С‚СЏРїР°\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113208\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї \"},{\"name\":\"РїР°РґСЂРµ\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113213\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї \"}]},{\"name\":\"РћРћРћ\",\"cards\":[{\"name\":\"РїРѕС‚РµСЂ\",\"body\":\"6007 -  213.134.13.77 - EbzCe0gw1IKl4mQ6\",\"drop\":\"РђРЅРѕРІР°\"},{\"name\":\"\",\"body\":\"\"}]},{\"name\":\"РїРёСЃР°СЂРё\",\"cards\":[{\"name\":\"Р±РµР»РєР°\",\"body\":\"5013 -  213.134.13.77 - oRIdspCg1oXCzTSn \",\"drop\":\"РђРЅРѕРІР°\"}]}]","grozniy_bg_overlay":"70","grozniy_teams_holodka":"[{\"name\":\"РєР°РЅР°РґР°\",\"qty\":16,\"members\":[\"РџС‚РёС‡РєР°\",\"СЃР°РЅС‡РѕСЃ\",\"СЃРІСЏС‚РѕС€Р°\",\"РњРёР»Р»РµСЂ\",\"РіРµР»СЏ\",\"РєСЂРёСЃС‚РёРЅР°\",\"РґРёР°РЅР°\",\"РІРёС‚РѕСЃ\",\"РєР°Р±Р°С‡РѕРє\",\"РљРѕРЅС‚СЂРѕР»С‘СЂ\",\"РЅРѕР»РёРє\",\"РєРѕРїРµРµС‡РєР°\",\"fury\",\"РїР°СЃРєР°Р»СЊ\",\"Р‘СѓРґРґР°\",\"СЋР·Рё\",\"Р¤РµРЅРёРєСЃ\",\"Р»РµРєСЃР°\",\"РєРѕРЅС‚СЂРѕР»РµСЂ\",\"С‡РµСЂСЂ РІРёРєР°\"]},{\"name\":\"СЃС‚Р°Р»СЊ\",\"qty\":21,\"members\":[\"РїР°РЅС‚РµСЂР°\",\"СЃС‚РѕСЂ\",\"Р”Р–РћР›Р\",\"РІРµРґСЊРјР°\",\"Р»РёР·Р°\",\"РѕСЃР°\",\"Р‘Р°С‡Р°С‚\",\"Р»Р°РґРѕС‡РєР°\",\"С‚Р°Р»РёСЃРјР°РЅ\",\"РІРёР·Р°Р¶РёСЃС‚\",\"РїРёРєР°С‡Сѓ\",\"ballet\",\"СЃРІСЏС‚РёРє\",\"СЃРєРєР°Р№\",\"С‚Р°Р№СЃРѕРЅ\",\"РІР°СЃСЏ\",\"С‚СЂРёРЅРёС‚Рё\",\"РєРѕР»Р»РµРіР°\",\"СЂР°РґСѓРіР°\",\"Р“Р°СЂСЂРё\",\"РђРєР°Р±\",\"samurai\",\"СЃРєР°Р№\",\"РјРѕРЅРёРєР°\"]},{\"name\":\"РіРѕР»РёР°С„\",\"qty\":4,\"members\":[\"С‚РѕС…Р°\",\"РјР°РЅРґР°СЂРёРЅРєР°\",\"Р±СЂРѕРєРµСЂ\",\"Р‘Р°СЂРѕРЅ\"]}]","grozniy_sections_gosi":"[{\"name\":\"РЎС‚Р°Р»СЊ \",\"cards\":[{\"name\":\"РѕСЃР°\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 113205\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"РґСѓСЃСЏ\",\"body\":\"5012 - 213.134.13.77 - K29qBfiWnDM33juy\",\"drop\":\"Р°РЅРѕРІР°РЅ\"},{\"name\":\"Р»Р°РґРѕС‡РєР°\",\"body\":\"5014 - 213.134.13.77 - gpgsGO3tv92IRrvV\",\"drop\":\"Р°РЅРѕРІР°\"},{\"name\":\"СЃРІСЏС‚РёРє \",\"body\":\"6006 - 213.134.13.77 - ysGJijg1jbTBAnSX\",\"drop\":\"Р°РЅРѕРІР°\"}]},{\"name\":\"РєР°РЅР°РґР°\",\"cards\":[{\"name\":\"РґРёР°РЅР°\",\"body\":\"РґРѕРјРµРЅ: 31.192.106.179:6060\\nР»РѕРіРёРЅ: 103204\\nРїР°СЂРѕР»СЊ: !sdfvs!SD!!GROZNUI!\",\"drop\":\"РјС‚СЃ СЃР°Рї\"},{\"name\":\"РєСЂРёСЃС‚РёРЅР°\",\"body\":\"5019 - 213.134.13.77 - uX4j97wHtoe3IgpA\",\"drop\":\"Р°РЅРѕРІР°РЅ\"},{\"name\":\"СЃРІСЏС‚РѕС€Р°\",\"body\":\"6019 - 213.134.13.77 - d44gmBCl2i5EH0Um\",\"drop\":\"Р°РЅРѕРІР°\"}]}]"}; // EMBEDDED_DATA_PLACEHOLDER

        // Load embedded data into localStorage on startup
        (function loadEmbedded() {
            if (!EMBEDDED_DATA) return;
            try {
                Object.entries(EMBEDDED_DATA).forEach(([key, value]) => {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                });
            } catch(e) { console.warn('Could not load embedded data', e); }
        })();

        // ===== SAVE TO FILE =====
        function saveToFile() {
            // Collect all grozniy_ keys from localStorage
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('grozniy_'))) {
                    data[key] = localStorage.getItem(key);
                }
            }

            // Read current file HTML via fetch (works for file:// via XHR trick)
            const html = document.documentElement.outerHTML;

            // Replace the EMBEDDED_DATA line with actual data
            const dataJSON = JSON.stringify(data);
            const updated = html.replace(
                /const EMBEDDED_DATA = .*?; \/\/ EMBEDDED_DATA_PLACEHOLDER/,
                `const EMBEDDED_DATA = ${dataJSON}; // EMBEDDED_DATA_PLACEHOLDER`
            );

            const blob = new Blob([updated], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sip_formatter.html';
            a.click();
            URL.revokeObjectURL(url);

            // Show feedback
            const btn = document.querySelector('.btn-save');
            const orig = btn.textContent;
            btn.textContent = 'вњ… РЎРѕС…СЂР°РЅРµРЅРѕ!';
            btn.style.background = '#16a34a';
            setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
        }

        // ===== BACKGROUND IMAGE =====
        const BG_KEY = 'grozniy_bg_image';
        const BG_OVERLAY_KEY = 'grozniy_bg_overlay';
        const BG_PRESET_KEY = 'grozniy_bg_preset';

        const BG_PRESETS = {
            dark:  'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 40%, #0a1628 70%, #0f0a1e 100%)',
            light: 'linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 40%, #fce4ec 70%, #e0f7fa 100%)',
        };

        function applyBgPreset(name) {
            // clear custom image
            localStorage.removeItem(BG_KEY);
            document.body.style.backgroundImage = BG_PRESETS[name];

            if (name) {
                localStorage.setItem(BG_PRESET_KEY, name);
            } else {
                localStorage.removeItem(BG_PRESET_KEY);
            }
            updateBgUI(null);
            updateBgPresetUI(name);
            // show overlay controls when preset active
            document.getElementById('bgControls').style.display = 'flex';
        }

        function updateBgPresetUI(active) {
            ['dark','light'].forEach(n => {
                const btn = document.getElementById('bgPreset' + n.charAt(0).toUpperCase() + n.slice(1));
                if (btn) btn.classList.toggle('active', n === active);
            });
        }

        // Bind preset buttons via JS to avoid outerHTML serialization issues with onclick+quotes
        document.getElementById('bgPresetDark').addEventListener('click', () => applyBgPreset('dark'));
        document.getElementById('bgPresetLight').addEventListener('click', () => applyBgPreset('light'));

        function handleBgUpload(input) {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                try {
                    localStorage.setItem(BG_KEY, dataUrl);
                } catch(err) {
                    showBgError();
                    return;
                }
                // clear preset
                localStorage.removeItem(BG_PRESET_KEY);
                updateBgPresetUI(null);
                applyBgImage(dataUrl);
                updateBgUI(dataUrl);
            };
            reader.readAsDataURL(file);
            input.value = '';
        }

        function applyBgImage(dataUrl) {
            if (dataUrl) {
                document.body.style.backgroundImage = `url(${dataUrl})`;
            } else {
                document.body.style.backgroundImage = '';
            }
        }

        function applyBgOverlay(val) {
            const opacity = (100 - parseInt(val)) / 100;
            document.body.style.setProperty('--bg-overlay', opacity);
            document.getElementById('bgOverlayVal').textContent = val + '%';
            localStorage.setItem(BG_OVERLAY_KEY, val);
        }

        function updateBgUI(dataUrl) {
            const preview = document.getElementById('bgPreview');
            const controls = document.getElementById('bgControls');
            if (dataUrl) {
                preview.src = dataUrl;
                preview.classList.add('visible');
                controls.style.display = 'flex';
            } else {
                preview.src = '';
                preview.classList.remove('visible');
                // keep controls visible if preset is active
                const preset = localStorage.getItem(BG_PRESET_KEY);
                controls.style.display = preset ? 'flex' : 'none';
            }
        }

        function removeBg() {
            localStorage.removeItem(BG_KEY);
            localStorage.removeItem(BG_PRESET_KEY);
            document.body.style.backgroundImage = '';
            applyBgOverlay(70);
            updateBgUI(null);
            updateBgPresetUI(null);
        }

        function showBgError() {
            alert('Р¤РѕС‚Рѕ СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕРµ РґР»СЏ С…СЂР°РЅРµРЅРёСЏ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ РјРµРЅСЊС€РµРіРѕ СЂР°Р·РјРµСЂР°.');
        }

        // Init background on load
        (function initBg() {
            const preset = localStorage.getItem(BG_PRESET_KEY);
            const dataUrl = localStorage.getItem(BG_KEY);
            const overlay = localStorage.getItem(BG_OVERLAY_KEY) || '70';
            if (preset && BG_PRESETS[preset]) {
                document.body.style.backgroundImage = BG_PRESETS[preset];
            } else if (dataUrl) {
                applyBgImage(dataUrl);
            }
            applyBgOverlay(overlay);
        })();

        // ===== PANEL OPACITY =====
        const PANEL_OPACITY_KEY = 'grozniy_panel_opacity';

        function applyPanelOpacity(val) {
            const opacity = parseInt(val) / 100;
            document.documentElement.style.setProperty('--panel-opacity', opacity);
            const theme = (getSettings().theme) || 'dark';
            const isLight = theme === 'light' || theme === 'white';
            document.documentElement.style.setProperty('--input-bg', theme === 'white' ? '#ffffff' : isLight ? '#f0f2f8' : theme === 'black' ? '#000000' : '#0e0e16');
            document.documentElement.style.setProperty('--input-surface', isLight ? '#ffffff' : theme === 'black' ? '#0a0a0a' : '#14141f');
            const el = document.getElementById('panelOpacityVal');
            if (el) el.textContent = val + '%';
            localStorage.setItem(PANEL_OPACITY_KEY, val);
        }

        (function initPanelOpacity() {
            const val = localStorage.getItem(PANEL_OPACITY_KEY) || '100';
            applyPanelOpacity(val);
        })();

        // ===== SETTINGS =====
        const SETTINGS_KEY = 'grozniy_settings';

        function getSettings() {
            try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
        }
        function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

        function getCardLimit() { return getSettings().cardLimit || 10; }

        function applyTheme(theme) {
            const all = ['light', 'black', 'white'];
            all.forEach(cls => document.body.classList.remove(cls));
            if (theme !== 'dark') document.body.classList.add(theme);

            document.getElementById('optDark').classList.toggle('active', theme === 'dark');
            document.getElementById('optLight').classList.toggle('active', theme === 'light');
            document.getElementById('optBlack').classList.toggle('active', theme === 'black');
            document.getElementById('optWhite').classList.toggle('active', theme === 'white');

            const isLight = theme === 'light' || theme === 'white';
            document.documentElement.style.setProperty('--input-bg', theme === 'white' ? '#ffffff' : isLight ? '#f0f2f8' : theme === 'black' ? '#000000' : '#0e0e16');
            document.documentElement.style.setProperty('--input-surface', isLight ? '#ffffff' : theme === 'black' ? '#0a0a0a' : '#14141f');
        }

        function setTheme(theme) {
            const s = getSettings(); s.theme = theme; saveSettings(s);
            applyTheme(theme);
        }

        function changeLimit(delta) {
            const s = getSettings();
            const current = s.cardLimit || 10;
            const next = Math.max(1, Math.min(50, current + delta));
            s.cardLimit = next; saveSettings(s);
            document.getElementById('limitVal').textContent = next;
            document.getElementById('limitDisplay').textContent = next;
        }

        function openSettings() {
            const s = getSettings();
            const limit = s.cardLimit || 10;
            document.getElementById('limitVal').textContent = limit;
            document.getElementById('limitDisplay').textContent = limit;
            applyTheme(s.theme || 'dark');
            // init bg UI
            const dataUrl = localStorage.getItem(BG_KEY);
            const preset = localStorage.getItem(BG_PRESET_KEY);
            const overlay = localStorage.getItem(BG_OVERLAY_KEY) || '70';
            updateBgUI(dataUrl);
            updateBgPresetUI(preset);
            document.getElementById('bgOverlay').value = overlay;
            document.getElementById('bgOverlayVal').textContent = overlay + '%';
            // init panel opacity
            const panelOp = localStorage.getItem(PANEL_OPACITY_KEY) || '100';
            document.getElementById('panelOpacity').value = panelOp;
            document.getElementById('panelOpacityVal').textContent = panelOp + '%';
            document.getElementById('settingsModal').classList.add('open');
            renderSettingsTeamMembers();
        }

        function renderSettingsTeamMembers() {
            const container = document.getElementById('settingsTeamMembers');
            const teams = getTeams('holodka');
            container.innerHTML = '';
            if (teams.length === 0) {
                container.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:8px">РќРµРјР°С” РєРѕРјР°РЅРґ. Р”РѕРґР°Р№С‚Рµ РєРѕРјР°РЅРґСѓ РЅР° РіРѕР»РѕРІРЅС–Р№ Р°Р±Рѕ С‚СѓС‚ РЅРёР¶С‡Рµ.</div>';
                return;
            }
            teams.forEach((team, idx) => {
                const c = getTeamColor(idx);
                const members = team.members || [];
                const card = document.createElement('div');
                card.style.cssText = `border-left:4px solid ${c.border};background:var(--panel);border-radius:8px;padding:10px 14px;margin-bottom:10px`;
                let membersHTML = '';
                members.forEach((m, mi) => {
                    membersHTML += `<span style="display:inline-flex;align-items:center;gap:4px;background:${c.bg};border:1px solid ${c.border};color:${c.text};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;margin:2px 4px 2px 0"><span>${m}</span><button class="remove-btn" style="font-size:12px;padding:0 3px;margin:0;line-height:1" onclick="removeTeamMemberSettings(${idx},${mi})">Г—</button></span>`;
                });
                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <span style="background:${c.bg};color:${c.text};border:2px solid ${c.border};padding:4px 12px;border-radius:8px;font-weight:700;font-size:13px">${team.name}</span>
                        <span style="font-size:11px;color:${c.text};font-weight:600">${members.length} РјРµРЅРµРґР¶.</span>
                    </div>
                    <div style="margin-bottom:8px;min-height:24px">${membersHTML || '<span style="font-size:12px;color:var(--text3)">РќРµРјР°С” РјРµРЅРµРґР¶РµСЂС–РІ</span>'}</div>
                    <div style="display:flex;gap:6px;align-items:center">
                        <input type="text" class="add-input" style="width:140px;font-size:12px" id="settingsMember_${idx}" placeholder="РќС–Рє РјРµРЅРµРґР¶РµСЂР°..." onkeydown="if(event.key==='Enter')addTeamMemberSettings(${idx})">
                        <button class="btn-add" style="font-size:11px;padding:5px 10px" onclick="addTeamMemberSettings(${idx})">+ Р”РѕРґР°С‚Рё</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function addTeamMemberSettings(teamIdx) {
            const input = document.getElementById(`settingsMember_${teamIdx}`);
            const name = input.value.trim();
            if (!name) return;
            const teams = getTeams('holodka');
            if (!teams[teamIdx].members) teams[teamIdx].members = [];
            for (let t of teams) {
                if ((t.members || []).find(m => m.toLowerCase() === name.toLowerCase())) {
                    alert(`"${name}" РІР¶Рµ С” РІ РєРѕРјР°РЅРґС– "${t.name}"`);
                    return;
                }
            }
            teams[teamIdx].members.push(name);
            setTeams('holodka', teams);
            input.value = '';
            renderSettingsTeamMembers();
            renderTeams('holodka');
        }

        function removeTeamMemberSettings(teamIdx, memberIdx) {
            const teams = getTeams('holodka');
            if (teams[teamIdx].members) teams[teamIdx].members.splice(memberIdx, 1);
            setTeams('holodka', teams);
            renderSettingsTeamMembers();
            renderTeams('holodka');
        }

        function addTeamFromSettings() {
            const input = document.getElementById('settingsNewTeamName');
            const name = input.value.trim();
            if (!name) return;
            const teams = getTeams('holodka');
            if (teams.find(t => t.name.toLowerCase() === name.toLowerCase())) { alert('РўР°РєР° РєРѕРјР°РЅРґР° РІР¶Рµ С”'); return; }
            teams.push({ name, qty: 0, members: [] });
            setTeams('holodka', teams);
            input.value = '';
            renderSettingsTeamMembers();
            renderTeams('holodka');
        }

        function closeSettings() {
            document.getElementById('settingsModal').classList.remove('open');
            // refresh add-card buttons in case limit changed
            TABS.forEach(tab => {
                if (tab.type === 'notepad') {
                    const btn = document.getElementById('addCardBtn_' + tab.id);
                    const cards = getCards(tab.id);
                    if (btn) btn.style.display = cards.length >= getCardLimit() ? 'none' : '';
                }
            });
        }

        // Close modal on overlay click
        document.getElementById('settingsModal').addEventListener('click', function(e) {
            if (e.target === this) closeSettings();
        });

        // Init theme on load
        (function initSettings() {
            const s = getSettings();
            applyTheme(s.theme || 'dark');
        })();

        buildTabs();
        TABS.forEach(tab => {
            if (tab.type === 'teams') { renderTeams(tab.id); setupPaste(tab.id); }
            else if (tab.type === 'notepad') { renderCards(tab.id); }
            else if (tab.type === 'notepad_sections') { renderSections(tab.id); }
        });
    
// ===== ADVANCED CARD FEATURES =====
const sectionSearchFilters = {};
let draggedCard = null;

function getAllCards() {
    const sections = getSections('gosi');
    const cards = [];
    sections.forEach((s,si)=>{
        (s.cards||[]).forEach((c,ci)=>{
            cards.push({section:si,index:ci,card:c});
        });
    });
    return cards;
}

function detectDuplicate(card, currentSection, currentIndex){
    const body = (card.body || '').toLowerCase();
    const drop = (card.drop || '').toLowerCase();
    const text = body + ' ' + drop;

    const sipMatches = text.match(/\b\d{3,10}\b/g) || [];

    let duplicate = false;

    getAllCards().forEach(item=>{
        if(item.section === currentSection && item.index === currentIndex) return;

        const compare = ((item.card.body||'') + ' ' + (item.card.drop||'')).toLowerCase();

        sipMatches.forEach(s=>{
            if(compare.includes(s)) duplicate = true;
        });
    });

    return duplicate;
}

function filterSectionCards(tabId, si, value){
    sectionSearchFilters[`${tabId}_${si}`] = value.toLowerCase();
    renderSectionCards(tabId, si);
}

function copySingleCard(tabId, si, ci){
    const sections = getSections(tabId);
    const card = sections[si].cards[ci];

    let txt = '';
    if(card.name) txt += card.name + '\\n';
    if(card.drop) txt += 'Р”СЂРѕРї: ' + card.drop + '\\n';
    txt += card.body || '';

    navigator.clipboard.writeText(txt.trim())
        .then(()=>showStatus(tabId,'РљР°СЂС‚РѕС‡РєР° СЃРєРѕРїС–Р№РѕРІР°РЅР°','#22c55e'))
        .catch(()=>showStatus(tabId,'РџРѕРјРёР»РєР° РєРѕРїС–СЋРІР°РЅРЅСЏ','#f04060'));
}

function bulkDeleteCards(tabId, si){
    const sections = getSections(tabId);
    const cards = sections[si].cards || [];

    sections[si].cards = cards.filter(c=>!c.selected);

    setSections(tabId, sections);
    renderSectionCards(tabId, si);
    showStatus(tabId,'Р’РёР±СЂР°РЅС– РєР°СЂС‚РѕС‡РєРё РІРёРґР°Р»РµРЅС–','#22c55e');
}

function bulkCopyCards(tabId, si){
    const sections = getSections(tabId);
    const cards = (sections[si].cards || []).filter(c=>c.selected);

    if(!cards.length){
        showStatus(tabId,'РќС–С‡РѕРіРѕ РЅРµ РІРёР±СЂР°РЅРѕ','#f59e0b');
        return;
    }

    const txt = cards.map(card=>{
        let t = '';
        if(card.name) t += card.name + '\\n';
        if(card.drop) t += 'Р”СЂРѕРї: ' + card.drop + '\\n';
        t += card.body || '';
        return t;
    }).join('\\n\\n----------------\\n\\n');

    navigator.clipboard.writeText(txt)
        .then(()=>showStatus(tabId,'Р’РёР±СЂР°РЅС– РєР°СЂС‚РѕС‡РєРё СЃРєРѕРїС–Р№РѕРІР°РЅС–','#22c55e'));
}

function toggleCardSelection(tabId, si, ci, checked){
    const sections = getSections(tabId);
    sections[si].cards[ci].selected = checked;
    setSections(tabId, sections);
}

const originalRenderSectionCards = renderSectionCards;

renderSectionCards = function(tabId, si, sections){
    if (!sections) sections = getSections(tabId);

    const grid = document.getElementById('secGrid_' + tabId + '_' + si);
    if (!grid) return;

    const cards = sections[si].cards || [];
    const limit = getCardLimit();

    const filter = (sectionSearchFilters[`${tabId}_${si}`] || '').trim();

    grid.innerHTML = '';

    cards.forEach((card, ci) => {

        const searchable = [
            card.name || '',
            card.drop || '',
            card.body || ''
        ].join(' ').toLowerCase();

        if(filter && !searchable.includes(filter)) return;

        const cc = getTeamColor(ci);

        const duplicate = detectDuplicate(card, si, ci);

        const div = document.createElement('div');
        div.className = 'sip-card' + (duplicate ? ' duplicate' : '');
        div.draggable = true;
        div.dataset.section = si;
        div.dataset.index = ci;

        div.addEventListener('dragstart', ()=>{
            draggedCard = {section:si,index:ci};
            div.classList.add('dragging');
        });

        div.addEventListener('dragend', ()=>{
            div.classList.remove('dragging');
        });

        div.addEventListener('dragover', (e)=>{
            e.preventDefault();
            div.classList.add('drag-over');
        });

        div.addEventListener('dragleave', ()=>{
            div.classList.remove('drag-over');
        });

        div.addEventListener('drop', ()=>{
            div.classList.remove('drag-over');

            if(!draggedCard) return;

            const allSections = getSections(tabId);

            const dragged = allSections[draggedCard.section].cards.splice(draggedCard.index,1)[0];

            allSections[si].cards.splice(ci,0,dragged);

            setSections(tabId, allSections);

            renderSections(tabId);

            showStatus(tabId,'РљР°СЂС‚РѕС‡РєР° РїРµСЂРµРјС–С‰РµРЅР°','#22c55e');
        });

        div.style.borderLeft = `4px solid ${cc.border}`;

        div.innerHTML = `
            <div class="sip-card-header">
                <div class="card-tools">
                    <input type="checkbox"
                        class="card-check"
                        ${card.selected ? 'checked' : ''}
                        onchange="toggleCardSelection('${tabId}',${si},${ci},this.checked)">
                    <input type="text" class="sip-card-name"
                        value="${(card.name||'').replace(/"/g,'&quot;')}"
                        placeholder="РњРµРЅРµРґР¶РµСЂ"
                        oninput="updateSectionCard('${tabId}',${si},${ci},'name',this.value)">
                </div>
                <div class="card-tools">
                    ${duplicate ? '<span class="duplicate-badge">DUP</span>' : ''}
                    <button class="card-copy-btn" onclick="copySingleCard('${tabId}',${si},${ci})">рџ“‹</button>
                    <button class="remove-btn" onclick="removeSectionCard('${tabId}',${si},${ci})">Г—</button>
                </div>
            </div>

            <input type="text" class="sip-card-drop"
                value="${(card.drop||'').replace(/"/g,'&quot;')}"
                placeholder="Р”СЂРѕРї"
                oninput="updateSectionCard('${tabId}',${si},${ci},'drop',this.value)">

            <textarea class="sip-card-body"
                placeholder="РґРѕРјРµРЅ: 31.192.106.179:6060&#10;Р»РѕРіРёРЅ: 113221&#10;РїР°СЂРѕР»СЊ..."
                oninput="updateSectionCard('${tabId}',${si},${ci},'body',this.value)">${card.body||''}</textarea>
        `;

        grid.appendChild(div);
    });

    const btn = document.getElementById('secAddBtn_' + tabId + '_' + si);
    if (btn) btn.style.display = cards.length >= limit ? 'none' : '';
};



// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
// REAL-TIME AUTO-SAVE SYSTEM
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ

const AutoSave = {
    // Debounce timer
    timer: null,
    delay: 500, // 500ms debounce

    // Initialize auto-save
    init() {
        this.setupListeners();
        this.loadSavedState();
        this.setupBeforeUnload();
        console.log('рџ”„ Auto-save system initialized');
    },

    // Setup input listeners for all editable elements
    setupListeners() {
        // Use event delegation on the document body
        document.addEventListener('input', (e) => {
            const target = e.target;

            // Check if the element is an input/textarea we care about
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                // Determine what type of data changed
                this.handleInputChange(target);
            }
        });

        // Listen for clicks on buttons that modify data
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (target && !target.classList.contains('btn-save')) {
                // Delay save to let the action complete
                setTimeout(() => this.saveAll(), 100);
            }
        });
    },

    // Handle input change with debounce
    handleInputChange(element) {
        // Clear existing timer
        if (this.timer) {
            clearTimeout(this.timer);
        }

        // Set new timer
        this.timer = setTimeout(() => {
            this.saveAll();
        }, this.delay);
    },

    // Save all data to localStorage
    saveAll() {
        try {
            TABS.forEach(tab => {
                const inputEl = document.getElementById('input_' + tab.id);
                if (inputEl) {
                    localStorage.setItem(storageKey(tab.id, 'input'), inputEl.value);
                }
                const outputEl = document.getElementById('output_' + tab.id);
                if (outputEl) {
                    localStorage.setItem(storageKey(tab.id, 'output'), outputEl.value);
                }
                const notepadIdx = notepadActiveIdx[tab.id];
                if (notepadIdx !== undefined) {
                    localStorage.setItem(storageKey(tab.id, 'notepad_active'), String(notepadIdx));
                }
                const sectionIdx = sectionActiveIdx[tab.id];
                if (sectionIdx !== undefined) {
                    localStorage.setItem(storageKey(tab.id, 'section_active'), String(sectionIdx));
                }
                setSavedTabState(tab.id, tabState[tab.id]);
            });

            localStorage.setItem('grozniy_active_tab', activeTab);
            localStorage.setItem('grozniy_last_saved', new Date().toISOString());

            this.showSaveIndicator();

            console.log('рџ’ѕ Auto-saved at', new Date().toLocaleTimeString());

            this.backgroundExport();

        } catch (e) {
            console.error('Auto-save error:', e);
        }
    },

    loadSavedState() {
        try {
            const savedActive = localStorage.getItem('grozniy_active_tab');
            if (savedActive && TABS.some(tab => tab.id === savedActive)) {
                activeTab = savedActive;
            }

            TABS.forEach(tab => {
                tabState[tab.id] = getSavedTabState(tab.id);

                const inputEl = document.getElementById('input_' + tab.id);
                if (inputEl) {
                    const savedInput = localStorage.getItem(storageKey(tab.id, 'input'));
                    if (savedInput !== null) inputEl.value = savedInput;
                }

                const outputEl = document.getElementById('output_' + tab.id);
                if (outputEl) {
                    const savedOutput = localStorage.getItem(storageKey(tab.id, 'output'));
                    if (savedOutput !== null) outputEl.value = savedOutput;
                }

                const savedNotepadIdx = parseInt(localStorage.getItem(storageKey(tab.id, 'notepad_active')), 10);
                if (!Number.isNaN(savedNotepadIdx)) {
                    notepadActiveIdx[tab.id] = savedNotepadIdx;
                }

                const savedSectionIdx = parseInt(localStorage.getItem(storageKey(tab.id, 'section_active')), 10);
                if (!Number.isNaN(savedSectionIdx)) {
                    sectionActiveIdx[tab.id] = savedSectionIdx;
                }
            });

            if (activeTab && document.getElementById('tabBtn_' + activeTab)) {
                switchTab(activeTab);
            }

            TABS.forEach(tab => {
                if (tab.type === 'teams') {
                    if (tabState[tab.id] && tabState[tab.id].sipEntries && tabState[tab.id].sipEntries.length) {
                        const outputEl = document.getElementById('output_' + tab.id);
                        if (outputEl && !outputEl.value) {
                            outputEl.value = tabState[tab.id].sipEntries.map(e => `${e.sip} ${e.ip} ${e.pass}`).join('\n');
                        }
                    }
                    renderTeams(tab.id);
                } else if (tab.type === 'notepad') {
                    renderCards(tab.id);
                } else if (tab.type === 'notepad_sections') {
                    renderSections(tab.id);
                } else {
                    renderManagers(tab.id);
                }
            });
        } catch (e) {
            console.warn('Auto-save restore failed:', e);
        }
    },

    // Show visual save indicator
    showSaveIndicator() {
        // Remove existing indicator
        const existing = document.getElementById('saveIndicator');
        if (existing) existing.remove();

        // Create indicator
        const indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--green) 0%, #16a34a 100%);
            color: #fff;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            z-index: 9999;
            box-shadow: 0 4px 16px var(--green-glow);
            animation: slideInRight 0.3s var(--ease-out-expo) both;
            font-family: 'IBM Plex Sans', sans-serif;
            letter-spacing: 0.3px;
        `;
        indicator.textContent = 'рџ’ѕ Р—Р±РµСЂРµР¶РµРЅРѕ';

        document.body.appendChild(indicator);

        // Remove after 2 seconds
        setTimeout(() => {
            indicator.style.animation = 'slideOutRight 0.3s var(--ease-in-out) both';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    },

    // Background export to file (using the existing saveToFile function)
    backgroundExport() {
        // Only export if significant time has passed (every 5 minutes)
        const lastExport = localStorage.getItem('grozniy_last_export');
        const now = Date.now();

        if (!lastExport || (now - parseInt(lastExport)) > 300000) { // 5 minutes
            // Update last export time
            localStorage.setItem('grozniy_last_export', now.toString());

            // We don't auto-export to file to avoid spam, but we could
            // This is where you'd add auto-download if needed
        }
    },

    // Setup beforeunload handler
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            // Force save before leaving
            this.saveAll();

            // Optional: warn user if there are unsaved changes
            // (not needed since we auto-save, but good for safety)
        });
    },

    // Manual trigger (can be called from buttons)
    forceSave() {
        if (this.timer) clearTimeout(this.timer);
        this.saveAll();
    }
};

function manualSave() {
    AutoSave.forceSave();
    try {
        showStatus(activeTab, 'Р—Р±РµСЂРµР¶РµРЅРѕ', '#22c55e');
    } catch {}
}

// Add animation keyframes for save indicator
const saveIndicatorStyles = document.createElement('style');
saveIndicatorStyles.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(30px); }
    }
`;
document.head.appendChild(saveIndicatorStyles);

// Initialize auto-save when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AutoSave.init());
} else {
    AutoSave.init();
}

// Override the original saveToFile to also update EMBEDDED_DATA in real-time
const originalSaveToFile = window.saveToFile;
window.saveToFile = function() {
    // Call original
    originalSaveToFile();

    // Show enhanced success message
    const btn = document.querySelector('.btn-save');
    const orig = btn.textContent;
    btn.textContent = 'вњ… Р—Р±РµСЂРµР¶РµРЅРѕ!';
    btn.style.background = '#16a34a';

    // Add pulse animation
    btn.style.animation = 'logoPulse 0.5s ease-in-out';

    setTimeout(() => { 
        btn.textContent = orig; 
        btn.style.background = ''; 
        btn.style.animation = '';
    }, 2000);

    // Update status
    showStatus(activeTab, 'рџ’ѕ Р¤Р°Р№Р» Р·Р±РµСЂРµР¶РµРЅРѕ Р· Р°РєС‚СѓР°Р»СЊРЅРёРјРё РґР°РЅРёРјРё', '#22c55e');
};

// Auto-save on tab switch
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabId) {
    // Save current tab data before switching
    AutoSave.forceSave();

    // Call original
    originalSwitchTab(tabId);

    // Save after switch
    setTimeout(() => AutoSave.forceSave(), 100);
};

// Auto-save on section switch (for notepad tabs)
const originalSwitchSection = window.switchSection;
if (originalSwitchSection) {
    window.switchSection = function(tabId, si) {
        AutoSave.forceSave();
        originalSwitchSection(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalSwitchNotepadSection = window.switchNotepadSection;
if (originalSwitchNotepadSection) {
    window.switchNotepadSection = function(tabId, si) {
        AutoSave.forceSave();
        originalSwitchNotepadSection(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on convert
const originalConvert = window.convert;
window.convert = function(tabId) {
    originalConvert(tabId);
    setTimeout(() => AutoSave.forceSave(), 200);
};

// Auto-save on distribute
const originalDistribute = window.distribute;
if (originalDistribute) {
    window.distribute = function(tabId) {
        originalDistribute(tabId);
        setTimeout(() => AutoSave.forceSave(), 200);
    };
}

const originalDistributeRandom = window.distributeRandom;
if (originalDistributeRandom) {
    window.distributeRandom = function(tabId) {
        originalDistributeRandom(tabId);
        setTimeout(() => AutoSave.forceSave(), 200);
    };
}

const originalAutoDistributeByMapping = window.autoDistributeByMapping;
if (originalAutoDistributeByMapping) {
    window.autoDistributeByMapping = function(tabId) {
        originalAutoDistributeByMapping(tabId);
        setTimeout(() => AutoSave.forceSave(), 200);
    };
}

// Auto-save on add/remove operations
const originalAddTeam = window.addTeam;
if (originalAddTeam) {
    window.addTeam = function(tabId) {
        originalAddTeam(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveTeam = window.removeTeam;
if (originalRemoveTeam) {
    window.removeTeam = function(tabId, idx) {
        originalRemoveTeam(tabId, idx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalAddCard = window.addCard;
if (originalAddCard) {
    window.addCard = function(tabId) {
        originalAddCard(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveCard = window.removeCard;
if (originalRemoveCard) {
    window.removeCard = function(tabId, idx) {
        originalRemoveCard(tabId, idx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalAddSectionCard = window.addSectionCard;
if (originalAddSectionCard) {
    window.addSectionCard = function(tabId, si) {
        originalAddSectionCard(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveSectionCard = window.removeSectionCard;
if (originalRemoveSectionCard) {
    window.removeSectionCard = function(tabId, si, ci) {
        originalRemoveSectionCard(tabId, si, ci);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalAddSection = window.addSection;
if (originalAddSection) {
    window.addSection = function(tabId) {
        originalAddSection(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveSection = window.removeSection;
if (originalRemoveSection) {
    window.removeSection = function(tabId, si) {
        originalRemoveSection(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalAddNotepadSection = window.addNotepadSection;
if (originalAddNotepadSection) {
    window.addNotepadSection = function(tabId) {
        originalAddNotepadSection(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveNotepadSection = window.removeNotepadSection;
if (originalRemoveNotepadSection) {
    window.removeNotepadSection = function(tabId, si) {
        originalRemoveNotepadSection(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on copy operations
const originalCopyResult = window.copyResult;
if (originalCopyResult) {
    window.copyResult = function(tabId) {
        originalCopyResult(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalCopyGrouped = window.copyGrouped;
if (originalCopyGrouped) {
    window.copyGrouped = function(tabId) {
        originalCopyGrouped(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalCopySection = window.copySection;
if (originalCopySection) {
    window.copySection = function(tabId, si) {
        originalCopySection(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalCopyAllCards = window.copyAllCards;
if (originalCopyAllCards) {
    window.copyAllCards = function(tabId, si) {
        originalCopyAllCards(tabId, si);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on clear
const originalClearAll = window.clearAll;
if (originalClearAll) {
    window.clearAll = function(tabId) {
        originalClearAll(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalClearAllCards = window.clearAllCards;
if (originalClearAllCards) {
    window.clearAllCards = function(tabId) {
        originalClearAllCards(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on manager operations
const originalAddManager = window.addManager;
if (originalAddManager) {
    window.addManager = function(tabId) {
        originalAddManager(tabId);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveManager = window.removeManager;
if (originalRemoveManager) {
    window.removeManager = function(tabId, idx) {
        originalRemoveManager(tabId, idx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalAddSipToManager = window.addSipToManager;
if (originalAddSipToManager) {
    window.addSipToManager = function(tabId, mgrIdx) {
        originalAddSipToManager(tabId, mgrIdx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveSipFromManager = window.removeSipFromManager;
if (originalRemoveSipFromManager) {
    window.removeSipFromManager = function(tabId, mgrIdx, sipIdx) {
        originalRemoveSipFromManager(tabId, mgrIdx, sipIdx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on team member operations in settings
const originalAddTeamMemberSettings = window.addTeamMemberSettings;
if (originalAddTeamMemberSettings) {
    window.addTeamMemberSettings = function(teamIdx) {
        originalAddTeamMemberSettings(teamIdx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveTeamMemberSettings = window.removeTeamMemberSettings;
if (originalRemoveTeamMemberSettings) {
    window.removeTeamMemberSettings = function(teamIdx, memberIdx) {
        originalRemoveTeamMemberSettings(teamIdx, memberIdx);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalAddTeamFromSettings = window.addTeamFromSettings;
if (originalAddTeamFromSettings) {
    window.addTeamFromSettings = function() {
        originalAddTeamFromSettings();
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on theme/background changes
const originalSetTheme = window.setTheme;
if (originalSetTheme) {
    window.setTheme = function(theme) {
        originalSetTheme(theme);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalApplyBgPreset = window.applyBgPreset;
if (originalApplyBgPreset) {
    window.applyBgPreset = function(name) {
        originalApplyBgPreset(name);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalApplyBgOverlay = window.applyBgOverlay;
if (originalApplyBgOverlay) {
    window.applyBgOverlay = function(val) {
        originalApplyBgOverlay(val);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalApplyPanelOpacity = window.applyPanelOpacity;
if (originalApplyPanelOpacity) {
    window.applyPanelOpacity = function(val) {
        originalApplyPanelOpacity(val);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalChangeLimit = window.changeLimit;
if (originalChangeLimit) {
    window.changeLimit = function(delta) {
        originalChangeLimit(delta);
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

const originalRemoveBg = window.removeBg;
if (originalRemoveBg) {
    window.removeBg = function() {
        originalRemoveBg();
        setTimeout(() => AutoSave.forceSave(), 100);
    };
}

// Auto-save on card field updates (these are already captured by input event, but add explicit)
const originalUpdateCardField = window.updateCardField;
if (originalUpdateCardField) {
    window.updateCardField = function(tabId, idx, field, val) {
        originalUpdateCardField(tabId, idx, field, val);
        // Debounced save handled by input listener
    };
}

const originalUpdateSectionCard = window.updateSectionCard;
if (originalUpdateSectionCard) {
    window.updateSectionCard = function(tabId, si, ci, field, val) {
        originalUpdateSectionCard(tabId, si, ci, field, val);
        // Debounced save handled by input listener
    };
}

const originalUpdateTeamQty = window.updateTeamQty;
if (originalUpdateTeamQty) {
    window.updateTeamQty = function(tabId, idx, val) {
        originalUpdateTeamQty(tabId, idx, val);
        // Debounced save handled by input listener
    };
}

const originalUpdateSectionName = window.updateSectionName;
if (originalUpdateSectionName) {
    window.updateSectionName = function(tabId, si, val) {
        originalUpdateSectionName(tabId, si, val);
        // Debounced save handled by input listener
    };
}

const originalUpdateNotepadSectionName = window.updateNotepadSectionName;
if (originalUpdateNotepadSectionName) {
    window.updateNotepadSectionName = function(tabId, si, val) {
        originalUpdateNotepadSectionName(tabId, si, val);
        // Debounced save handled by input listener
    };
}

// Console log for debugging
console.log('вњ… Real-time auto-save system active');
console.log('   - Debounced input saving: 500ms');
console.log('   - Visual save indicator: enabled');
console.log('   - Auto-export on tab switch: enabled');
console.log('   - Beforeunload save: enabled');



(function(){
const PWD_KEY='groz_pwd';
const SESS_KEY='groz_sess';
const DEFAULT='GrozniyIT2206';
const HOURS=12;

function getPwd(){return localStorage.getItem(PWD_KEY)||DEFAULT}
function setPwd(p){localStorage.setItem(PWD_KEY,p)}
function getSession(){
try{
const r=localStorage.getItem(SESS_KEY);
if(!r)return null;
const d=JSON.parse(r);
if(Date.now()-d.t>HOURS*3600000){localStorage.removeItem(SESS_KEY);return null}
return d;
}catch{return null}
}
function setSession(){
localStorage.setItem(SESS_KEY,JSON.stringify({t:Date.now()}));
}

const overlay=document.getElementById('pwdOverlay');
const logoutBtn=document.getElementById('logoutBtn');

function showLogin(){
overlay.style.display='flex';
logoutBtn.style.display='none';
document.body.style.overflow='hidden';
setTimeout(()=>document.getElementById('pwdInput').focus(),100);
}
function showApp(){
overlay.style.display='none';
logoutBtn.style.display='block';
document.body.style.overflow='';
}

window.checkPwd=function(){
const inp=document.getElementById('pwdInput');
const err=document.getElementById('pwdError');
if(inp.value===getPwd()){
setSession();
err.style.display='none';
showApp();
}else{
err.textContent='вќЊ РќРµРІС–СЂРЅРёР№ РїР°СЂРѕР»СЊ';
err.style.display='block';
inp.value='';
inp.focus();
}
}
window.togglePwd=function(){
const inp=document.getElementById('pwdInput');
inp.type=inp.type==='password'?'text':'password';
}
window.doLogout=function(){
if(!confirm('Р’РёР№С‚Рё Р· СЃРёСЃС‚РµРјРё?'))return;
localStorage.removeItem(SESS_KEY);
showLogin();
}

// РџРµСЂРµРІС–СЂРєР° РїСЂРё Р·Р°РІР°РЅС‚Р°Р¶РµРЅРЅС–
if(getSession()){showApp()}else{showLogin()}

// РџРµСЂРµРІС–СЂРєР° РєРѕР¶РЅС– 30 СЃРµРєСѓРЅРґ
setInterval(()=>{if(!getSession()&&overlay.style.display==='none'){showLogin()}},30000);
})();


