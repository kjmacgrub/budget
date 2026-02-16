// ============================================================
// Budget Planner - app.js
// ============================================================

let currentMonth = null;
let allMonths = [];

// UI state
let panelsExpanded = false;
let showZeroIncome = false;
let showZeroExpense = false;
let allExpanded = false;

const defaultBudget = {
    customCategories: {
        income: {
            displayName: 'Income Items',
            type: 'income'
        },
        credit: {
            displayName: 'Credit Cards',
            type: 'expense'
        },
        monthly: {
            displayName: 'Recurring Expenses',
            type: 'expense'
        },
        utils: {
            displayName: 'Utilities',
            type: 'expense'
        }
    },
    income: [
        { name: 'Monthly Income', amount: 3750 },
        { name: 'Additional Income', amount: 5587 }
    ],
    credit: [
        { name: 'Chase', amount: 1411.28 },
        { name: 'Amex', amount: 67.42 },
        { name: 'Fidelity', amount: 6339.59 }
    ],
    monthly: [
        { name: 'Cash', amount: 100 },
        { name: 'Coffee', amount: 200 },
        { name: 'Copayments', amount: 40 },
        { name: 'Doctors', amount: 125 },
        { name: 'Food', amount: 1200 },
        { name: 'HOA', amount: 390 },
        { name: 'Personal', amount: 50 },
        { name: 'MTA', amount: 150 },
        { name: 'RC', amount: 100 },
        { name: 'Therapy', amount: 1350 }
    ],
    utils: [
        { name: 'ConEd', amount: 100 },
        { name: 'Fios', amount: 85 },
        { name: 'Nat Grid', amount: 150 }
    ],
    oneTime: [
        { name: 'House Insurance', amount: 1500 }
    ],
    startingBalance: 18000
};

// ============================================================
// Storage helpers
// ============================================================

function loadBudgetData(month) {
    const data = localStorage.getItem(`budget:${month || currentMonth}`);
    return data ? JSON.parse(data) : getCurrentBudgetData();
}

function saveBudgetData(data, month) {
    localStorage.setItem(`budget:${month || currentMonth}`, JSON.stringify(data));
}

// ============================================================
// App initialization
// ============================================================

function initApp() {
    loadFromLocalStorage();

    if (!currentMonth || allMonths.length === 0) {
        createInitialMonth();
    }

    renderMonthTabs();
    loadMonth(currentMonth);

    // Show info modal on first load
    if (!localStorage.getItem('budgetInfoShown')) {
        setTimeout(() => {
            document.getElementById('infoModal').classList.add('active');
            localStorage.setItem('budgetInfoShown', 'true');
        }, 1000);
    }
}

function loadFromLocalStorage() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('budget:')) {
            keys.push(key.replace('budget:', ''));
        }
    }
    if (keys.length > 0) {
        allMonths = keys.sort().reverse();
        currentMonth = allMonths[0];
    }
}

function createInitialMonth() {
    const today = new Date();
    const monthName = `${today.getMonth() + 1}.${today.getDate()}.${today.getFullYear().toString().slice(-2)}`;

    saveBudgetData(defaultBudget, monthName);

    allMonths = [monthName];
    currentMonth = monthName;
}

// ============================================================
// Month navigation
// ============================================================

function renderMonthTabs() {
    const menu = document.getElementById('monthDropdownMenu');
    const display = document.getElementById('selectedMonthDisplay');

    if (!menu || !display) return;

    menu.innerHTML = '';

    allMonths.forEach(month => {
        const option = document.createElement('div');
        option.className = `month-option ${month === currentMonth ? 'selected' : ''}`;

        const monthText = document.createElement('span');
        monthText.textContent = formatMonthDisplay(month);
        monthText.style.flex = '1';
        monthText.style.cursor = 'pointer';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'month-delete-x';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteMonth(month);
        };

        option.appendChild(monthText);
        option.appendChild(deleteBtn);

        option.onclick = (e) => {
            if (e.target !== deleteBtn) {
                selectMonth(month);
            }
        };

        menu.appendChild(option);
    });

    // Add "New Date" button at the bottom
    const newMonthBtn = document.createElement('div');
    newMonthBtn.className = 'month-option new-month-option';
    newMonthBtn.textContent = '+ New Date';
    newMonthBtn.onclick = () => {
        toggleMonthDropdown();
        createNewMonth();
    };
    menu.appendChild(newMonthBtn);

    display.textContent = formatMonthDisplay(currentMonth);
}

function toggleMonthDropdown() {
    const menu = document.getElementById('monthDropdownMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function selectMonth(month) {
    if (month !== currentMonth) {
        currentMonth = month;
        toggleMonthDropdown();
        renderMonthTabs();
        loadMonth(month);
    } else {
        toggleMonthDropdown();
    }
}

function deleteMonth(month) {
    if (allMonths.length === 1) return;

    localStorage.removeItem(`budget:${month}`);

    const index = allMonths.indexOf(month);
    allMonths.splice(index, 1);

    if (currentMonth === month) {
        currentMonth = allMonths[0];
        loadMonth(currentMonth);
    }

    renderMonthTabs();
}

function createNewMonth() {
    const modal = document.getElementById('newDateModal');
    const datePicker = document.getElementById('newDatePicker');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${year}-${month}-${day}`;

    modal.style.display = 'flex';
}

function hideNewDateModal() {
    document.getElementById('newDateModal').style.display = 'none';
}

function createNewMonthFromPicker() {
    const datePicker = document.getElementById('newDatePicker');
    const dateValue = datePicker.value;

    if (!dateValue) {
        alert('Please select a date');
        return;
    }

    const [year, month, day] = dateValue.split('-');
    const shortYear = year.slice(-2);
    const newMonth = `${parseInt(month)}.${parseInt(day)}.${shortYear}`;

    if (allMonths.includes(newMonth)) {
        alert('This date already exists. Please choose a different date.');
        return;
    }

    const templateData = getCurrentBudgetData();
    templateData.startingBalance = 0;

    saveBudgetData(templateData, newMonth);

    allMonths.push(newMonth);
    allMonths.sort();

    currentMonth = newMonth;
    window.currentStartingBalance = 0;
    loadMonth(currentMonth);
    renderMonthTabs();

    hideNewDateModal();
}

function deleteCurrentMonth() {
    if (allMonths.length === 1) {
        alert('Cannot delete the last month');
        return;
    }

    if (confirm(`Are you sure you want to delete ${currentMonth}? This cannot be undone.`)) {
        localStorage.removeItem(`budget:${currentMonth}`);

        const index = allMonths.indexOf(currentMonth);
        allMonths.splice(index, 1);

        currentMonth = allMonths[0];

        renderMonthTabs();
        loadMonth(currentMonth);
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('monthDropdownMenu');
    const displayDropdown = document.querySelector('.month-display-dropdown');

    if (menu && menu.classList.contains('active')) {
        if (!menu.contains(event.target) && !displayDropdown.contains(event.target)) {
            menu.classList.remove('active');
        }
    }

    const modal = document.getElementById('newDateModal');
    if (modal && event.target === modal) {
        hideNewDateModal();
    }
});

// ============================================================
// Date formatting
// ============================================================

function formatMonthDisplay(monthStr) {
    const parts = monthStr.split('.');
    if (parts.length === 3) {
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]) + 2000;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];

        return `${monthNames[month - 1]} ${day}, ${year}`;
    }
    return monthStr;
}

// ============================================================
// Data loading & saving
// ============================================================

function loadMonth(month) {
    let budgetData = defaultBudget;

    const localData = localStorage.getItem(`budget:${month}`);
    if (localData) {
        budgetData = JSON.parse(localData);
    }

    window.currentStartingBalance = budgetData.startingBalance !== undefined ? budgetData.startingBalance : 0;

    renderBudget(budgetData);
}

function saveBudget() {
    const budgetData = getCurrentBudgetData();
    try {
        localStorage.setItem(`budget:${currentMonth}`, JSON.stringify(budgetData));
    } catch (e) {
        console.error('LocalStorage save failed:', e);
    }
}

function getCurrentBudgetData() {
    const budgetData = {
        startingBalance: window.currentStartingBalance || 18000,
        customCategories: {}
    };

    const allLists = document.querySelectorAll('[id$="List"]');

    allLists.forEach(list => {
        const categoryKey = list.id.replace('List', '');
        const items = list.querySelectorAll('.expense-item');

        if (items.length > 0 || categoryKey) {
            budgetData[categoryKey] = [];

            items.forEach(item => {
                const label = item.querySelector('.expense-label');
                const input = item.querySelector('.expense-input');
                if (label && input) {
                    const cleanValue = input.value.replace(/,/g, '');
                    budgetData[categoryKey].push({
                        name: label.textContent,
                        amount: parseFloat(cleanValue) || 0
                    });
                }
            });
        }
    });

    document.querySelectorAll('.subsection').forEach(subsection => {
        const titleElement = subsection.querySelector('.subsection-name, .editable-category');
        if (titleElement) {
            const displayName = titleElement.textContent.trim();
            const listElement = subsection.querySelector('[id$="List"]');
            if (listElement) {
                const categoryKey = listElement.id.replace('List', '');
                const isIncome = subsection.closest('.income-section');
                const type = isIncome ? 'income' : 'expense';

                budgetData.customCategories[categoryKey] = {
                    displayName: displayName,
                    type: type
                };
            }
        }
    });

    return budgetData;
}

// ============================================================
// Currency formatting
// ============================================================

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatCurrencyWithSuperscriptCents(value) {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);

    const parts = formatted.split('.');
    if (parts.length === 2) {
        return `${parts[0]}<sup class="cents">.${parts[1]}</sup>`;
    }
    return formatted;
}

function formatCurrencyWhole(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.trunc(value));
}

function formatNumberWithCommas(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function removeCommasOnFocus(input) {
    const value = input.value.replace(/,/g, '');
    input.value = value;
    input.select();
}

function formatAndSaveAmount(input) {
    const cleanValue = input.value.replace(/,/g, '');
    const numValue = parseFloat(cleanValue) || 0;

    input.value = formatNumberWithCommas(numValue);

    saveBudget();
    calculateTotals();
}

// ============================================================
// Rendering
// ============================================================

function renderBudget(data) {
    if (!data.customCategories) {
        data.customCategories = {
            income: { displayName: 'Income Items', type: 'income' },
            credit: { displayName: 'Credit Cards', type: 'expense' },
            monthly: { displayName: 'Recurring Expenses', type: 'expense' },
            utils: { displayName: 'Utilities', type: 'expense' }
        };
    }

    const content = `
        <div class="two-column-wrapper">
            <!-- Income Section -->
            <div class="section-card income-section">
                <h2 class="section-title collapsed" onclick="toggleSection(this)">
                    <span class="section-title-text">
                        Future Income
                    </span>
                    <span class="section-total" id="totalIncome">$0</span>
                    <button class="add-category-plus" onclick="event.stopPropagation(); toggleAddCategoryForm('income')" title="Add Income Category">+</button>
                </h2>
                <div class="section-content collapsed">
                    <div class="eye-toggle-wrapper">
                        <button class="eye-toggle-centered" onclick="toggleZeroItems('income')" title="Show/hide zero-value items">
                            <span class="toggle-text hide-zeros-text">hide zeros</span>
                            <span class="toggle-text show-all-text">show all</span>
                        </button>
                    </div>
                    ${renderCategoriesByType(data, 'income')}

                    <div class="add-expense-form" id="addIncomeCategoryForm" style="margin-top: 1rem; padding-left: 2rem;">
                        <div class="form-group">
                            <input type="text" id="newIncomeCategoryName" placeholder="Category Name (e.g., Freelance, Dividends)">
                        </div>
                        <div class="form-buttons">
                            <button class="btn-save" onclick="addNewCategory('income')">Create Category</button>
                            <button class="btn-cancel" onclick="toggleAddCategoryForm('income')">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Expenses Section -->
            <div class="section-card expense-section">
                <h2 class="section-title collapsed" onclick="toggleSection(this)">
                    <span class="section-title-text">
                        Future Expenses
                    </span>
                    <span class="section-total" id="totalExpenses">$0</span>
                    <button class="add-category-plus" onclick="event.stopPropagation(); toggleAddCategoryForm('expense')" title="Add Expense Category">+</button>
                </h2>
                <div class="section-content collapsed">
                    <div class="eye-toggle-wrapper">
                        <button class="eye-toggle-centered" onclick="toggleZeroItems('expense')" title="Show/hide zero-value items">
                            <span class="toggle-text hide-zeros-text">hide zeros</span>
                            <span class="toggle-text show-all-text">show all</span>
                        </button>
                    </div>
                    ${renderCategoriesByType(data, 'expense')}

                    <div class="add-expense-form" id="addExpenseCategoryForm" style="margin-top: 1rem; padding-left: 2rem;">
                        <div class="form-group">
                            <input type="text" id="newExpenseCategoryName" placeholder="Category Name (e.g., Travel, Entertainment)">
                        </div>
                        <div class="form-buttons">
                            <button class="btn-save" onclick="addNewCategory('expense')">Create Category</button>
                            <button class="btn-cancel" onclick="toggleAddCategoryForm('expense')">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('budgetContent').innerHTML = content;

    document.querySelectorAll('.expense-input').forEach(input => {
        input.addEventListener('input', () => {
            calculateTotals();
            saveBudget();
        });
    });

    const startingBalanceInput = document.getElementById('startingBalanceInput');
    if (startingBalanceInput) {
        const startingBalance = data.startingBalance || 0;
        startingBalanceInput.value = formatCurrencyWhole(startingBalance);
        window.currentStartingBalance = startingBalance;
    }

    calculateTotals();
}

function renderItems(items, category) {
    const budgetData = getCurrentBudgetData();
    const categoryMeta = budgetData.customCategories ? budgetData.customCategories[category] : null;

    let isIncome = false;
    if (categoryMeta) {
        isIncome = categoryMeta.type === 'income';
    } else {
        isIncome = category === 'income' || category.toLowerCase().includes('income');
    }

    const showZeros = isIncome ? showZeroIncome : showZeroExpense;

    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));

    return sortedItems.map((item, index) => {
        const amount = parseFloat(item.amount) || 0;
        const isZero = amount === 0;
        const hideClass = (isZero && !showZeros) ? ' hide-zero-item' : '';

        return `
        <div class="expense-item${hideClass}">
            <span class="expense-label editable-label"
                  contenteditable="true"
                  data-category="${category}"
                  data-index="${index}"
                  data-item-name="${item.name}"
                  onblur="saveItemName('${category}', ${index}, this)"
                  onkeypress="if(event.key==='Enter') { event.preventDefault(); this.blur(); }"
                  title="Click to edit">${item.name}</span>
            <button class="delete-item-btn" onclick="deleteItem('${category}', ${index})">×</button>
            <input type="text" class="expense-input" value="${formatNumberWithCommas(item.amount)}"
                   data-category="${category}"
                   data-index="${index}"
                   data-item-name="${item.name}"
                   onfocus="removeCommasOnFocus(this)"
                   onblur="formatAndSaveAmount(this)"
                   onkeypress="if(event.key==='Enter') this.blur()"
                   onmouseover="showAverageTooltip(this, '${category}', '${item.name}')"
                   onmouseout="hideAverageTooltip(this)">
        </div>
    `;
    }).join('');
}

function renderCategoriesByType(data, type) {
    if (!data.customCategories) return '';

    let html = '';
    const sortedCategories = Object.entries(data.customCategories)
        .filter(([key, meta]) => meta.type === type && data[key])
        .sort(([, metaA], [, metaB]) => metaA.displayName.localeCompare(metaB.displayName));

    for (const [key, meta] of sortedCategories) {
        html += `
            <div class="subsection">
                <h3 class="subsection-title">
                    <span class="subsection-name-group">
                        <span class="subsection-name editable-category"
                              contenteditable="true"
                              data-category-key="${key}"
                              onblur="saveCategoryName('${key}', this)"
                              onkeypress="if(event.key==='Enter') { event.preventDefault(); this.blur(); }"
                              onclick="event.stopPropagation();"
                              title="Click to edit">${meta.displayName}</span>
                        <button class="delete-category-x" onclick="event.stopPropagation(); deleteCategory('${key}', '${meta.displayName}')">×</button>
                    </span>
                    <span class="subsection-total" id="total_${key}">$0</span>
                </h3>
                <div class="subsection-content">
                    <div id="${key}List">${renderItems(data[key], key)}</div>
                    <div class="add-item-button-wrapper">
                        <span class="add-item-text" onclick="showAddForm('${key}')">New ${meta.displayName}</span>
                    </div>
                    <div class="add-expense-form" id="add_${key}">
                        <div class="form-group">
                            <input type="text" id="new_${key}_Name" placeholder="Item Name">
                            <input type="number" id="new_${key}_Amount" placeholder="Amount">
                        </div>
                        <div class="form-buttons">
                            <button class="btn-save" onclick="addExpense('${key}')">Save</button>
                            <button class="btn-cancel" onclick="hideAddForm('${key}')">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    return html;
}

// ============================================================
// Calculations
// ============================================================

function calculateTotals() {
    let startingBalance = window.currentStartingBalance || 0;
    const startingInput = document.getElementById('startingBalanceInput');
    if (startingInput) {
        const cleanValue = startingInput.value.replace(/[^0-9.]/g, '');
        startingBalance = parseFloat(cleanValue) || 0;
        window.currentStartingBalance = startingBalance;
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    const allInputs = document.querySelectorAll('.expense-input');
    const categoryTotals = {};

    allInputs.forEach(input => {
        const category = input.getAttribute('data-category');
        const cleanValue = input.value.replace(/,/g, '');
        const value = parseFloat(cleanValue) || 0;

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }
        categoryTotals[category] += value;
    });

    for (const [category, total] of Object.entries(categoryTotals)) {
        const totalElement = document.getElementById(`total_${category}`);
        if (totalElement) {
            totalElement.innerHTML = formatCurrencyWithSuperscriptCents(total);
        }

        const categoryElement = document.getElementById(`${category}List`);
        if (categoryElement) {
            const incomeSection = document.querySelector('.income-section');
            const expenseSection = document.querySelector('.expense-section');

            if (incomeSection && incomeSection.contains(categoryElement)) {
                totalIncome += total;
            } else if (expenseSection && expenseSection.contains(categoryElement)) {
                totalExpenses += total;
            }
        }
    }

    const endingBalance = startingBalance + totalIncome - totalExpenses;

    document.getElementById('totalIncome').innerHTML = formatCurrencyWithSuperscriptCents(totalIncome);
    document.getElementById('totalExpenses').innerHTML = formatCurrencyWithSuperscriptCents(totalExpenses);

    const endingBalanceElement = document.getElementById('endingBalanceDisplay');
    endingBalanceElement.innerHTML = formatCurrencyWithSuperscriptCents(endingBalance);

    if (endingBalance < 0) {
        endingBalanceElement.classList.add('negative');
    } else {
        endingBalanceElement.classList.remove('negative');
    }
}

// ============================================================
// Balance & starting balance
// ============================================================

function selectStartingBalance() {
    const input = document.getElementById('startingBalanceInput');
    if (input) {
        const value = input.value.replace(/[^0-9.]/g, '');
        input.value = value;
        input.select();
    }
}

function formatAndSaveStartingBalance() {
    const input = document.getElementById('startingBalanceInput');
    if (input) {
        const cleanValue = input.value.replace(/[^0-9.]/g, '');
        const numValue = parseFloat(cleanValue) || 0;

        window.currentStartingBalance = numValue;
        input.value = formatCurrencyWhole(numValue);

        calculateTotals();
        saveBudget();
    }
}

function updateStartingBalance(value) {
    window.currentStartingBalance = parseFloat(value) || 0;
    calculateTotals();
    saveBudget();
}

// ============================================================
// Section toggle controls
// ============================================================

function toggleSection(titleElement) {
    const content = titleElement.nextElementSibling;
    titleElement.classList.toggle('collapsed');
    content.classList.toggle('collapsed');
}

function toggleSubsection(titleElement) {
    const content = titleElement.nextElementSibling;
    if (content) {
        titleElement.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
    }
}

function toggleExpandCollapseAll() {
    const button = document.getElementById('expandCollapseBtn');

    const sectionTitles = document.querySelectorAll('.section-title');
    const subsectionTitles = document.querySelectorAll('.subsection-title');

    if (allExpanded) {
        sectionTitles.forEach(title => {
            const content = title.nextElementSibling;
            if (content && !title.classList.contains('collapsed')) {
                title.classList.add('collapsed');
                content.classList.add('collapsed');
            }
        });
        subsectionTitles.forEach(title => {
            const content = title.nextElementSibling;
            if (content && !title.classList.contains('collapsed')) {
                title.classList.add('collapsed');
                content.classList.add('collapsed');
            }
        });
        button.innerHTML = '&#9660; Expand All';
        allExpanded = false;
    } else {
        sectionTitles.forEach(title => {
            const content = title.nextElementSibling;
            if (content && title.classList.contains('collapsed')) {
                title.classList.remove('collapsed');
                content.classList.remove('collapsed');
            }
        });
        subsectionTitles.forEach(title => {
            const content = title.nextElementSibling;
            if (content && title.classList.contains('collapsed')) {
                title.classList.remove('collapsed');
                content.classList.remove('collapsed');
            }
        });
        button.innerHTML = '&#9650; Collapse All';
        allExpanded = true;
    }
}

function toggleZeroItems(sectionType) {
    if (sectionType === 'income') {
        showZeroIncome = !showZeroIncome;
    } else {
        showZeroExpense = !showZeroExpense;
    }

    const incomeExpanded = !document.querySelector('.income-section .section-title')?.classList.contains('collapsed');
    const expenseExpanded = !document.querySelector('.expense-section .section-title')?.classList.contains('collapsed');

    const budgetData = getCurrentBudgetData();
    renderBudget(budgetData);

    setTimeout(() => {
        const incomeSectionTitle = document.querySelector('.income-section .section-title');
        const incomeSectionContent = document.querySelector('.income-section .section-content');
        const expenseSectionTitle = document.querySelector('.expense-section .section-title');
        const expenseSectionContent = document.querySelector('.expense-section .section-content');

        if (incomeExpanded && incomeSectionTitle && incomeSectionContent) {
            incomeSectionTitle.classList.remove('collapsed');
            incomeSectionContent.classList.remove('collapsed');
        }

        if (expenseExpanded && expenseSectionTitle && expenseSectionContent) {
            expenseSectionTitle.classList.remove('collapsed');
            expenseSectionContent.classList.remove('collapsed');
        }

        const eyeButton = document.querySelector(`.${sectionType}-section .eye-toggle-centered`);
        if (eyeButton) {
            if ((sectionType === 'income' && showZeroIncome) || (sectionType === 'expense' && showZeroExpense)) {
                eyeButton.classList.add('active');
            } else {
                eyeButton.classList.remove('active');
            }
        }
    }, 10);
}

// ============================================================
// Panel visibility
// ============================================================

function toggleBudgetPanels() {
    const budgetContent = document.getElementById('budgetContent');
    if (!budgetContent) return;

    panelsExpanded = !panelsExpanded;

    if (panelsExpanded) {
        budgetContent.style.display = 'block';

        const incomeSection = document.querySelector('.income-section');
        const expenseSection = document.querySelector('.expense-section');
        if (incomeSection) incomeSection.style.display = 'block';
        if (expenseSection) expenseSection.style.display = 'block';

        const incomeSectionContent = document.querySelector('.income-section .section-content');
        const expensesSectionContent = document.querySelector('.expense-section .section-content');
        const incomeSectionTitle = document.querySelector('.income-section .section-title');
        const expensesSectionTitle = document.querySelector('.expense-section .section-title');

        if (incomeSectionContent) incomeSectionContent.classList.add('collapsed');
        if (expensesSectionContent) expensesSectionContent.classList.add('collapsed');
        if (incomeSectionTitle) incomeSectionTitle.classList.add('collapsed');
        if (expensesSectionTitle) expensesSectionTitle.classList.add('collapsed');

        setTimeout(() => {
            budgetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        budgetContent.style.display = 'none';

        const balanceSummary = document.querySelector('.balance-summary');
        if (balanceSummary) {
            balanceSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function showIncomeOnly() {
    const budgetContent = document.getElementById('budgetContent');
    if (!budgetContent) return;

    const incomeSection = document.querySelector('.income-section');
    const expenseSection = document.querySelector('.expense-section');

    const incomeVisible = incomeSection && incomeSection.style.display !== 'none';
    const expenseHidden = expenseSection && expenseSection.style.display === 'none';
    const isIncomeOnlyShowing = incomeVisible && expenseHidden && budgetContent.style.display !== 'none';

    if (isIncomeOnlyShowing) {
        budgetContent.style.display = 'none';
        panelsExpanded = false;

        const balanceSummary = document.querySelector('.balance-summary');
        if (balanceSummary) {
            balanceSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        budgetContent.style.display = 'block';
        panelsExpanded = true;

        if (incomeSection) incomeSection.style.display = 'block';
        if (expenseSection) expenseSection.style.display = 'none';

        setTimeout(() => {
            budgetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function showExpensesOnly() {
    const budgetContent = document.getElementById('budgetContent');
    if (!budgetContent) return;

    const incomeSection = document.querySelector('.income-section');
    const expenseSection = document.querySelector('.expense-section');

    const expenseVisible = expenseSection && expenseSection.style.display !== 'none';
    const incomeHidden = incomeSection && incomeSection.style.display === 'none';
    const isExpenseOnlyShowing = expenseVisible && incomeHidden && budgetContent.style.display !== 'none';

    if (isExpenseOnlyShowing) {
        budgetContent.style.display = 'none';
        panelsExpanded = false;

        const balanceSummary = document.querySelector('.balance-summary');
        if (balanceSummary) {
            balanceSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        budgetContent.style.display = 'block';
        panelsExpanded = true;

        if (incomeSection) incomeSection.style.display = 'none';
        if (expenseSection) expenseSection.style.display = 'block';

        setTimeout(() => {
            budgetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// ============================================================
// Category management
// ============================================================

function toggleAddCategoryForm(type) {
    const formId = type === 'income' ? 'addIncomeCategoryForm' : 'addExpenseCategoryForm';
    const inputId = type === 'income' ? 'newIncomeCategoryName' : 'newExpenseCategoryName';

    const sectionClass = type === 'income' ? '.income-section' : '.expense-section';
    const sectionTitle = document.querySelector(`${sectionClass} .section-title`);
    const sectionContent = document.querySelector(`${sectionClass} .section-content`);

    if (sectionTitle && sectionContent) {
        if (sectionTitle.classList.contains('collapsed')) {
            sectionTitle.classList.remove('collapsed');
            sectionContent.classList.remove('collapsed');
        }
    }

    const form = document.getElementById(formId);
    if (form) {
        form.classList.toggle('active');
        if (form.classList.contains('active')) {
            const input = document.getElementById(inputId);
            if (input) input.focus();
        } else {
            const input = document.getElementById(inputId);
            if (input) input.value = '';
        }
    }
}

function addNewCategory(type) {
    const inputId = type === 'income' ? 'newIncomeCategoryName' : 'newExpenseCategoryName';
    const nameInput = document.getElementById(inputId);

    if (!nameInput) {
        alert('Error: Could not find input field');
        return;
    }

    const categoryName = nameInput.value.trim();

    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }

    const budgetData = loadBudgetData();

    const categoryKey = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const categoryExistsInData = budgetData[categoryKey] && Array.isArray(budgetData[categoryKey]);
    const categoryExistsInMeta = budgetData.customCategories && budgetData.customCategories[categoryKey];

    if (categoryExistsInData && categoryExistsInMeta) {
        alert('A category with this name already exists! Try a different name.');
        return;
    }

    budgetData[categoryKey] = [];

    if (!budgetData.customCategories) {
        budgetData.customCategories = {};
    }
    budgetData.customCategories[categoryKey] = {
        displayName: categoryName,
        type: type
    };

    saveBudgetData(budgetData);

    nameInput.value = '';
    toggleAddCategoryForm(type);

    // Save expansion state before reloading
    const incomeSectionTitle = document.querySelector('.income-section .section-title');
    const expenseSectionTitle = document.querySelector('.expense-section .section-title');
    const incomeWasExpanded = incomeSectionTitle && !incomeSectionTitle.classList.contains('collapsed');
    const expenseWasExpanded = expenseSectionTitle && !expenseSectionTitle.classList.contains('collapsed');

    loadMonth(currentMonth);

    // Restore expansion state
    setTimeout(() => {
        if (type === 'income' && incomeWasExpanded) {
            const incomeTitle = document.querySelector('.income-section .section-title');
            const incomeContent = document.querySelector('.income-section .section-content');
            if (incomeTitle && incomeContent) {
                incomeTitle.classList.remove('collapsed');
                incomeContent.classList.remove('collapsed');
            }
        } else if (type === 'expense' && expenseWasExpanded) {
            const expenseTitle = document.querySelector('.expense-section .section-title');
            const expenseContent = document.querySelector('.expense-section .section-content');
            if (expenseTitle && expenseContent) {
                expenseTitle.classList.remove('collapsed');
                expenseContent.classList.remove('collapsed');
            }
        }
        calculateTotals();
    }, 50);
}

function deleteCategory(categoryKey, displayName) {
    const budgetData = loadBudgetData();

    delete budgetData[categoryKey];

    if (budgetData.customCategories) {
        delete budgetData.customCategories[categoryKey];
    }

    saveBudgetData(budgetData);

    loadMonth(currentMonth);
}

// ============================================================
// Item management
// ============================================================

function showAddForm(category) {
    let formId = `add_${category}`;
    let form = document.getElementById(formId);

    if (!form) {
        formId = `add${category.charAt(0).toUpperCase()}${category.slice(1)}`;
        form = document.getElementById(formId);
    }

    if (form) {
        form.classList.add('active');
    }
}

function hideAddForm(category) {
    let formId = `add_${category}`;
    let nameId = `new_${category}_Name`;
    let amountId = `new_${category}_Amount`;

    let form = document.getElementById(formId);
    let nameInput = document.getElementById(nameId);
    let amountInput = document.getElementById(amountId);

    if (!form) {
        formId = `add${category.charAt(0).toUpperCase()}${category.slice(1)}`;
        nameId = `new${category.charAt(0).toUpperCase()}${category.slice(1)}Name`;
        amountId = `new${category.charAt(0).toUpperCase()}${category.slice(1)}Amount`;

        form = document.getElementById(formId);
        nameInput = document.getElementById(nameId);
        amountInput = document.getElementById(amountId);
    }

    if (form) form.classList.remove('active');
    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';
}

function addExpense(category) {
    let nameInput, amountInput;

    nameInput = document.getElementById(`new_${category}_Name`);
    amountInput = document.getElementById(`new_${category}_Amount`);

    if (!nameInput || !amountInput) {
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        nameInput = document.getElementById('new' + capitalizedCategory + 'Name');
        amountInput = document.getElementById('new' + capitalizedCategory + 'Amount');
    }

    if (!nameInput || !amountInput) return;

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;

    if (!name) return;

    const budgetData = loadBudgetData();

    if (!budgetData[category]) {
        budgetData[category] = [];
    }

    budgetData[category].push({ name, amount });

    saveBudgetData(budgetData);

    nameInput.value = '';
    amountInput.value = '';
    hideAddForm(category);

    // Refresh just the category list
    const categoryList = document.getElementById(`${category}List`);
    if (categoryList) {
        categoryList.innerHTML = renderItems(budgetData[category], category);

        categoryList.querySelectorAll('.expense-input').forEach(input => {
            input.addEventListener('input', () => {
                calculateTotals();
                saveBudget();
            });
        });
    }

    calculateTotals();
}

function deleteItem(category, index) {
    const budgetData = loadBudgetData();

    if (budgetData[category] && budgetData[category].length > index) {
        budgetData[category].splice(index, 1);
    } else {
        return;
    }

    saveBudgetData(budgetData);

    loadMonth(currentMonth);
}

function saveItemName(category, index, element) {
    const newName = element.textContent.trim();

    if (!newName) {
        loadMonth(currentMonth);
        return;
    }

    const budgetData = loadBudgetData();

    if (budgetData[category] && budgetData[category][index]) {
        budgetData[category][index].name = newName;
        saveBudgetData(budgetData);
    }
}

function saveItemDate(category, index, newDate) {
    const budgetData = loadBudgetData();

    if (budgetData[category] && budgetData[category][index]) {
        budgetData[category][index].date = newDate;
        saveBudgetData(budgetData);
    }
}

function saveCategoryName(categoryKey, element) {
    const newName = element.textContent.trim();

    if (!newName) {
        loadMonth(currentMonth);
        return;
    }

    const budgetData = loadBudgetData();

    if (!budgetData.customCategories) {
        budgetData.customCategories = {
            income: { displayName: 'Income Items', type: 'income' },
            credit: { displayName: 'Credit Cards', type: 'expense' },
            monthly: { displayName: 'Recurring Expenses', type: 'expense' },
            utils: { displayName: 'Utilities', type: 'expense' }
        };
    }

    if (budgetData.customCategories && budgetData.customCategories[categoryKey]) {
        budgetData.customCategories[categoryKey].displayName = newName;

        saveBudgetData(budgetData);

        element.textContent = newName;

        const subsectionContent = element.closest('.subsection');
        if (subsectionContent) {
            const addButton = subsectionContent.querySelector('.add-button-small');
            if (addButton) {
                addButton.textContent = `+ New ${newName}`;
            }
        }
    }
}

// ============================================================
// Average tooltip
// ============================================================

function showAverageTooltip(inputElement, category, itemName) {
    const averages = [];

    for (const month of allMonths) {
        if (month === currentMonth) continue;

        const localData = localStorage.getItem(`budget:${month}`);
        const monthData = localData ? JSON.parse(localData) : null;

        if (monthData && monthData[category]) {
            const matchingItem = monthData[category].find(item => item.name === itemName);
            if (matchingItem && matchingItem.amount) {
                averages.push(matchingItem.amount);
            }
        }
    }

    if (averages.length > 0) {
        const average = averages.reduce((sum, val) => sum + val, 0) / averages.length;
        inputElement.setAttribute('title', `Average from ${averages.length} previous month${averages.length > 1 ? 's' : ''}: ${formatCurrency(average)}`);
    } else {
        inputElement.setAttribute('title', 'No previous data for this item');
    }
}

function hideAverageTooltip(inputElement) {
    inputElement.removeAttribute('title');
}

// ============================================================
// Export / Import
// ============================================================

function exportData() {
    try {
        const allData = {};

        for (const month of allMonths) {
            const localData = localStorage.getItem(`budget:${month}`);
            if (localData) {
                allData[month] = JSON.parse(localData);
            }
        }

        // Scan localStorage for any budget: keys we might have missed
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('budget:')) {
                const month = key.replace('budget:', '');
                if (!allData[month]) {
                    const localData = localStorage.getItem(key);
                    if (localData) {
                        allData[month] = JSON.parse(localData);
                    }
                }
            }
        }

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        alert('Backup exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Clear existing data
            for (const month of allMonths) {
                localStorage.removeItem(`budget:${month}`);
            }

            // Import new data
            for (const [month, data] of Object.entries(importedData)) {
                localStorage.setItem(`budget:${month}`, JSON.stringify(data));
            }

            allMonths = Object.keys(importedData).sort().reverse();
            currentMonth = allMonths[0];

            alert('Data imported successfully! Page will reload to show your data.');

            window.location.reload();
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing data. Please make sure the file is a valid budget backup.');
        }
    };

    reader.readAsText(file);
    event.target.value = '';
}

// ============================================================
// Modal helpers
// ============================================================

function hideInfoModal() {
    document.getElementById('infoModal').classList.remove('active');
}

// ============================================================
// Initialize
// ============================================================

initApp();
