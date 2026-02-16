# Budget Planner

A clean, minimal budget planner application with a focus on simplicity and user experience.

## Features

### Core Functionality
- **Monthly Budget Tracking** - Separate budgets for each month
- **Custom Categories** - Create your own income and expense categories
- **Starting Balance** - Track your projected balance across months
- **Auto-Save** - Changes saved automatically to browser localStorage
- **Export/Import** - Backup and restore your data as JSON files

### User Interface
- **Two-Column Layout** - Income on left, Expenses on right
- **Collapsible Sections** - Expand/collapse categories for focused view
- **Inline Editing** - Click to edit item names and amounts
- **Zero-Value Toggle** - Show/hide items with zero amounts
- **Smart Number Formatting** - Automatic comma formatting and decimal handling
- **Historical Averages** - Hover over amounts to see average across months

### Interactive Controls
- **Balance Panel** - Visual arrow showing flow from starting to projected balance
- **Multiple Toggle Options**:
  - Main arrow → Show/hide both income and expenses
  - Green up arrow (▲) → Show income only
  - Red down arrow (▼) → Show expenses only
  - Projected balance → Click to toggle both sections
- **Mobile Responsive** - Optimized for touch interactions

### Design
- **Minimal Aesthetic** - Clean, styled text controls instead of heavy buttons
- **Sage Green Theme** - Calm, professional color palette
- **Font Hierarchy** - Fraunces (headers), DM Sans (body), Vollkorn (balance)
- **Smooth Animations** - Subtle hover effects and transitions

## Getting Started

### Installation
1. Download `budget-planner.html`
2. Open in any modern web browser
3. Start adding your income and expenses!

That's it - no server, no account, no installation required.

### Quick Start
1. Select your month from the dropdown
2. Expand "Future Income" section
3. Click "New Income Items" to add income sources
4. Expand "Future Expenses" section
5. Click "New [Category]" to add expenses
6. Watch your projected balance update automatically

## Data Storage

All data is stored **locally in your browser** using localStorage. This means:

✅ **Private** - Data never leaves your device  
✅ **Fast** - Instant load and save  
✅ **Offline** - Works without internet  
✅ **No account needed** - Start using immediately  

⚠️ **Important**: Export your data regularly as backups! Clearing browser data will delete your budgets.

See `budget-planner-data-storage-explained.md` for detailed information.

## Usage Tips

### Organization
- Create custom categories that match your spending patterns
- Use "show all" to see zero-value placeholders you've set up
- Rename categories by clicking on their names

### Navigation
- Use individual toggle arrows (▲▼) to focus on income or expenses
- Click projected balance or main arrow to see everything
- Month selector shows all created months for quick switching

### Data Management
- **Export regularly** - Download your complete budget as JSON
- **Import on new devices** - Transfer your data easily
- **Delete old months** - Use the × next to months you don't need

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires JavaScript and localStorage support.

## Technical Details

- **Pure client-side** - Single HTML file, no backend required
- **No dependencies** - Vanilla JavaScript, no frameworks
- **localStorage** - ~5-10MB storage capacity (plenty for years of budgets)
- **Responsive design** - Mobile-first approach with desktop enhancements

## File Structure

```
budget-planner-v1.59.zip
├── budget-planner.html                          # Main application (155KB)
├── budget-planner-data-storage-explained.md     # Data storage documentation
└── README.md                                     # This file
```

## Version History

**v1.59** (Current)
- Full arrow clickable area in balance section
- Styled text controls throughout (consistent minimal design)
- Zero-value item toggle with "show all" / "hide zeros"
- Individual section toggles (income/expense)
- Mobile-optimized controls

See commits for detailed change history.

## Privacy & Security

This application:
- ✅ Runs entirely in your browser
- ✅ Makes no network requests
- ✅ Stores no data on servers
- ✅ Collects no analytics
- ✅ Uses no cookies
- ✅ Requires no authentication

Your financial data is completely private and under your control.

## Contributing

This is a personal project, but feel free to:
- Fork and modify for your own use
- Submit issues or suggestions
- Share improvements

## License

Free to use and modify for personal use.

## Credits

Built with attention to detail and user experience in mind.

---

**Need help?** Check `budget-planner-data-storage-explained.md` for data management information.

**Want to backup?** Click the Export button at the bottom of the page regularly!
