import os

emoji_map = {
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
}

files_to_process = [
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
]

for filepath in files_to_process:
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    imports = set()
    
    # Clean up option tags containing emojis
    for emoji in emoji_map.keys():
        content = content.replace(f">{emoji} ", ">")
        content = content.replace(f">{emoji}", ">")
    
    # 2. String literal replacements for `icon: "📊"` -> `icon: <FaChartSimple />`
    for emoji, icon in emoji_map.items():
        if f'"{emoji}"' in content:
            content = content.replace(f'"{emoji}"', f'<{icon} />')
            imports.add(icon)
            
    # 3. Inside JSX text (not inside strings/quotes)
    for emoji, icon in emoji_map.items():
        if emoji in content:
            content = content.replace(f'{emoji} ', f'<{icon} className="icon-inline" /> ')
            content = content.replace(f'{emoji}', f'<{icon} className="icon-inline" />')
            imports.add(icon)
            
    if content != original and imports:
        import_stmt = f"import {{ {', '.join(sorted(imports))} }} from 'react-icons/fa6';\n"
        if '"use client";' in content:
            content = content.replace('"use client";', f'"use client";\n{import_stmt}', 1)
        else:
            content = import_stmt + content
            
        with open(filepath, 'w') as f:
            f.write(content)

print("done")
