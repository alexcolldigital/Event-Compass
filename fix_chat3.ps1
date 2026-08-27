$file = 'frontend\src\screens\main\ChatScreen.tsx'
$content = Get-Content $file -Raw

# Insert </View> closing messageArea before the Typing indicator comment
$content = $content -replace '      \)\}\r\n\r\n      \{/\* Typing indicator', "      )}`r`n      </View>`r`n`r`n      {/* Typing indicator"

Set-Content $file $content -NoNewline
Write-Host 'Done'
