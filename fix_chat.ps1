$file = 'frontend\src\screens\main\ChatScreen.tsx'
$content = Get-Content $file -Raw
$content = $content -replace '  KeyboardAvoidingView,\r\n  Alert,', "  KeyboardAvoidingView,`r`n  SafeAreaView,`r`n  Alert,"
$content = $content -replace 'return \(\r\n    <KeyboardAvoidingView', "return (`r`n    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>`r`n    <KeyboardAvoidingView"
$content = $content -replace '    </KeyboardAvoidingView>\r\n  \);', "    </KeyboardAvoidingView>`r`n    </SafeAreaView>`r`n  );"
$content = $content -replace '\{/\* Messages \*/\}\r\n      \{isLoading \?', "{/* Messages */}`r`n      <View style={styles.messageArea}>`r`n      {isLoading ?"
$content = $content -replace '  screen: \{ flex: 1 \},', "  safeArea: { flex: 1 },`r`n  screen: { flex: 1 },`r`n  messageArea: { flex: 1 },"
Set-Content $file $content -NoNewline
Write-Host 'Done'
