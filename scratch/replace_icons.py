import os
import re

emoji_map = {
    '⚗️': 'FaFlask',
    '🚀': 'FaRocket',
    '⚖️': 'FaScaleBalanced',
    '💰': 'FaMoneyBillWave',
    '📦': 'FaBoxOpen',
    '🔐': 'FaLock',
    '🔍': 'FaMagnifyingGlass',
    '📊': 'FaChartBar',
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
        
    icons_used = set()
    new_content = content
    
    for emoji, icon in emoji_map.items():
        if emoji in new_content:
            icons_used.add(icon)
            # Find exact occurrences. Note: Emojis might have variation selectors or be next to text.
            # We'll replace it with the component tag. For some places, like strings, it might need to be wrapped.
            # Emojis in JSX text can just be replaced with `<Icon />`.
            # But wait, in strings like `icon: "📊"`, we need to change the string to a component or remove quotes.
            # Let's do replacements more carefully via manual script or manual tool calls if it's too complex.
            pass

print("Script created")
