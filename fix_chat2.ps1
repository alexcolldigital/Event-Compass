$file = 'frontend\src\screens\main\ChatScreen.tsx'
$content = Get-Content $file -Raw

# Close messageArea View before Typing indicator (two blank lines before comment)
$content = $content -replace '      \)\}\r\n\r\n\r\n      \{/\* Typing indicator', "      )}`r`n      </View>`r`n`r`n      {/* Typing indicator"

# Add paddingBottom to inputBar on Android
$content = $content -replace 'styles\.inputBar, \{ backgroundColor: colors\.surface, borderTopColor: colors\.border \}', "styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Platform.OS === 'android' ? 10 : 0 }"

Set-Content $file $content -NoNewline
Write-Host 'Done'
