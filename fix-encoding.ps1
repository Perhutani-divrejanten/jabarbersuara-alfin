# Script untuk memperbaiki quotation encoding dan karakter khusus

$WorkspaceRoot = "c:\KULIAH\MAGANG\Magang di Perhutani\Jabar Bersuara"

# Define replacements untuk quotation dan special characters
# Menggunakan RegEx pattern string
$replacements = @(
    @{ Pattern = '[""]'; Regular = '"' },       # Smart quotes " → "
    @{ Pattern = "['']"; Regular = "'" },       # Smart quotes ' → '
    @{ Pattern = '-'; Regular = '-' },          # En dash → hyphen
    @{ Pattern = '-'; Regular = '-' },          # Em dash → hyphen
    @{ Pattern = '[\u00a0]'; Regular = ' ' },   # Non-breaking space → space
    @{ Pattern = '[\u00ad]'; Regular = '' },    # Soft hyphen → nothing
    @{ Pattern = '[\ufffd]'; Regular = ' ' }    # Replacement character → space
)

$fileTypes = @("*.html", "*.css", "*.js", "*.json", "*.md")
$filesUpdated = 0

Write-Host "Starting quotation encoding fix..."
Write-Host ""

foreach ($fileType in $fileTypes) {
    $files = Get-ChildItem -Path $WorkspaceRoot -Recurse -Include $fileType -File |
             Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\archive\*" }
    
    foreach ($file in $files) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $originalContent = $content
            
            # Apply replacements
            foreach ($replacement in $replacements) {
                $content = $content -replace $replacement.Pattern, $replacement.Regular
            }
            
            # Check if content changed
            if ($content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                $filesUpdated++
                Write-Host "Fixed encoding in: $($file.Name)"
            }
        } catch {
            Write-Host "Error processing $($file.FullName): $_" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Quotation encoding fix complete!"
Write-Host "Total files updated: $filesUpdated"
