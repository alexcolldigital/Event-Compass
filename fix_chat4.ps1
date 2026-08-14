$file = 'frontend\src\screens\main\ChatScreen.tsx'
$content = Get-Content $file -Raw

# The file uses LF after "      )}" before the Typing indicator comment
$content = $content -replace '      \)\}\n\n      \{/\* Typing indicator', "      )}`n      </View>`n`n      {/* Typing indicator"

Set-Content $file $content -NoNewline
Write-Host 'Done'
