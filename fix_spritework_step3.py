# Fix step 3 in spritework.md (curly quotes)
with open('spritework.md', 'r', encoding='utf-8') as f:
    s = f.read()
old = '3. **BootScene create:** Create the animation (see \u201cCreate the animation in create()\u201d above). Use a key like `hero_<name>`.'
new = '3. **BootScene create:** Add an entry to the `oneShotAnims` array: `{ sheetKey: \'hero_<name>_sheet\', animKey: \'hero_<name>\' }`. (Or call `registerOneShotHeroAnim` directly if needed.) Idle is created separately.'
if old in s:
    s = s.replace(old, new)
    with open('spritework.md', 'w', encoding='utf-8') as f:
        f.write(s)
    print('Replaced step 3')
else:
    print('Pattern not found')
