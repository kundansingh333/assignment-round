const fs = require('fs');
const path = require('path');

const emojiMap = {
    '⚗️': 'FaFlask',
    '🚀': 'FaRocket',
    '⚖️': 'FaScaleBalanced',
    '💰': 'FaMoneyBillWave',
    '📦': 'FaBoxOpen',
    '🔐': 'FaLock',
    '🔍': 'FaMagnifyingGlass',
    '📊': 'FaChartSimple',
    '🏷️': 'FaTags',
    '📋': 'FaClipboardList',
    '📈': 'FaArrowTrendUp',
    '🛒': 'FaCartShopping',
    '🛍️': 'FaBagShopping',
    '🚪': 'FaArrowRightFromBracket',
    '⏳': 'FaHourglassHalf',
    '✅': 'FaCheck',
    '🚚': 'FaTruckFast',
    '❌': 'FaXmark',
    '🎉': 'FaPartyPopper',
    '✏️': 'FaPen',
    '🚫': 'FaBan',
    '🗑️': 'FaTrash',
    '⚠️': 'FaTriangleExclamation',
    '💡': 'FaLightbulb',
    '🧪': 'FaVial',
};

const filesToProcess = [
    'src/components/LandingClient.tsx',
    'src/app/login/page.tsx',
    'src/app/register/page.tsx',
    'src/components/AdminLayoutClient.tsx',
    'src/app/admin/page.tsx',
    'src/components/AdminProductsClient.tsx',
    'src/components/AdminOrdersClient.tsx',
    'src/components/AdminCategoriesClient.tsx',
    'src/app/admin/inventory/page.tsx',
    'src/components/ShopLayoutClient.tsx',
    'src/components/ShopProductsClient.tsx',
    'src/app/shop/cart/page.tsx',
    'src/components/ShopOrdersClient.tsx',
    'src/components/SellerLayoutClient.tsx',
    'src/app/seller/page.tsx',
];

for (const filepath of filesToProcess) {
    if (!fs.existsSync(filepath)) continue;
    
    let content = fs.readFileSync(filepath, 'utf8');
    const original = content;
    const imports = new Set();
    
    // 1. Remove emojis from <option> tags
    content = content.replace(/<option([^>]*)>([^<]*)<\/option>/g, (match, p1, p2) => {
        let newP2 = p2;
        for (const emoji of Object.keys(emojiMap)) {
            newP2 = newP2.replace(emoji + ' ', '').replace(emoji, '');
        }
        return `<option${p1}>${newP2}</option>`;
    });

    // 2. Replace emojis wrapped in quotes inside objects (e.g. icon: "📊" -> icon: <FaChartSimple />)
    // and replace other strings as well. For object props like icon: "📊"
    for (const [emoji, icon] of Object.entries(emojiMap)) {
        if (content.includes(`"${emoji}"`)) {
            content = content.split(`"${emoji}"`).join(`<${icon} />`);
            imports.add(icon);
        }
    }
    
    // 3. Status icons object values (e.g. PENDING: "⏳") handled by above if we just do "⏳"
    
    // 4. Emojis in JSX text nodes or string literals without quotes matching perfectly
    // E.g. <div className="icon">📋</div> -> <div className="icon"><FaClipboardList /></div>
    // E.g. <span className="logo">⚗️ AasaMedChem</span> -> <span className="logo"><FaFlask className="icon-inline" /> AasaMedChem</span>
    for (const [emoji, icon] of Object.entries(emojiMap)) {
        if (content.includes(emoji)) {
            // Replace `emoji ` (with space)
            content = content.split(`${emoji} `).join(`<${icon} className="icon-inline" /> `);
            // Replace remaining `emoji`
            content = content.split(emoji).join(`<${icon} />`);
            imports.add(icon);
        }
    }
    
    if (content !== original && imports.size > 0) {
        const importStmt = `import { ${Array.from(imports).sort().join(', ')} } from 'react-icons/fa6';\n`;
        if (content.includes('"use client";')) {
            content = content.replace('"use client";', `"use client";\n${importStmt}`);
        } else {
            // Put it after other imports or at top
            content = importStmt + content;
        }
        fs.writeFileSync(filepath, content, 'utf8');
    }
}
console.log("done");
