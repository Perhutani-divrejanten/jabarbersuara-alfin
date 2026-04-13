# Final Verification Script - Memastikan rebrand Jabar Bersuara selesai dengan baik

$WorkspaceRoot = "c:\KULIAH\MAGANG\Magang di Perhutani\Jabar Bersuara"

Write-Host "========== FINAL VERIFICATION - JABAR BERSUARA REBRAND ==========" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$stats = @{
    "Branding pages checked" = 0
    "Old branding found" = 0
    "Logo image found" = 0
    "New colors found" = 0
}

# 1. Check for old branding strings
Write-Host "1. Checking for old branding strings..." -ForegroundColor Yellow
$legacyBrandingPatterns = @(
    ('Warta' + ' Janten'),
    ('warta' + 'janten'),
    ('Warta' + 'Janten')
)
$htmlCssJsonFiles = Get-ChildItem -Path $WorkspaceRoot -Recurse -Include "*.html", "*.css", "*.json", "*.md" -File |
    Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.bak.*" -and $_.FullName -notlike "*package-lock*" }

foreach ($pattern in $legacyBrandingPatterns) {
    $found = $htmlCssJsonFiles | Select-String -Pattern $pattern -ErrorAction SilentlyContinue
    if ($found) {
        foreach ($result in $found) {
            $issues += @{
                Type = "Old Branding"
                File = ($result.Path | Split-Path -Leaf)
                Line = $result.LineNumber
                Pattern = $pattern
            }
            $stats["Old branding found"]++
        }
    }
}

if ($stats["Old branding found"] -eq 0) {
    Write-Host "   ✅ No old branding references found!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Found old branding in $($stats['Old branding found']) places" -ForegroundColor Yellow
}

# 2. Check for legacy brand image references
$legacyBrandImage = 'logo' + '.png'
Write-Host "2. Checking for legacy brand image references..." -ForegroundColor Yellow
$logoFound = Get-ChildItem -Path $WorkspaceRoot -Recurse -Include "*.html" -File |
    Select-String -Pattern [regex]::Escape($legacyBrandImage) -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -notlike "*\.bak.*" }

if ($logoFound) {
    $stats["Logo image found"] = $logoFound.Count
    Write-Host "   ⚠️  Found $($logoFound.Count) legacy brand image references" -ForegroundColor Yellow
    foreach ($ref in $logoFound | Select-Object -First 5) {
        Write-Host "      - $($ref.Path | Split-Path -Leaf)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ No legacy brand image references found!" -ForegroundColor Green
}

# 3. Check for new colors in CSS
Write-Host "3. Checking for new color scheme in CSS files..." -ForegroundColor Yellow
$cssFiles = Get-ChildItem -Path (Join-Path $WorkspaceRoot "css") -Include "*.css" -File -ErrorAction SilentlyContinue

$newColors = @("#0EA5E9", "#075985", "#1F5F1F")
$colorsFound = 0

foreach ($color in $newColors) {
    $found = $cssFiles | Select-String -Pattern $color -ErrorAction SilentlyContinue
    if ($found) {
        $colorsFound++
        Write-Host "   ✅ Found $color in CSS" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Not found: $color" -ForegroundColor Yellow
    }
}

# 4. Check for new branding
Write-Host "4. Checking for new branding 'Jabar Bersuara'..." -ForegroundColor Yellow
$newBrandingFound = Get-ChildItem -Path $WorkspaceRoot -Recurse -Include "*.html" -File |
    Select-String -Pattern "Jabar Bersuara|Jabar Bersuara|jabarbersuara" -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -notlike "*\.bak.*" } | 
    Measure-Object

if ($newBrandingFound.Count -gt 0) {
    Write-Host "   ✅ Found 'Jabar Bersuara' branding in $($newBrandingFound.Count) places" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No 'Jabar Bersuara' branding found!" -ForegroundColor Yellow
    $issues += @{ Type = "Missing"; File = "All"; Reason = "No Jabar Bersuara branding found" }
}

# 5. Check package.json updates
Write-Host "5. Checking package.json updates..." -ForegroundColor Yellow
$pkgFiles = Get-ChildItem -Path $WorkspaceRoot -Recurse -Include "package.json" -File |
    Where-Object { $_.FullName -notlike "*\node_modules\*" }

$pkgOK = 0
foreach ($pkg in $pkgFiles) {
    $content = Get-Content $pkg.FullName -Raw
    if ($content -match '"name"\s*:\s*"jabarbersuara') {
        $pkgOK++
        Write-Host "   ✅ $($pkg.Name) has proper branding" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
Write-Host "========== SUMMARY ==========" -ForegroundColor Cyan
Write-Host "Files checked: $($htmlCssJsonFiles.Count)" -ForegroundColor White
Write-Host "Old branding issues: $($stats['Old branding found'])" -ForegroundColor $(if ($stats["Old branding found"] -eq 0) { "Green" } else { "Yellow" })
Write-Host "Logo image references: $($stats['Logo image found'])" -ForegroundColor $(if ($stats["Logo image found"] -eq 0) { "Green" } else { "Yellow" })
Write-Host "New color scheme found: $colorsFound/3" -ForegroundColor $(if ($colorsFound -eq 3) { "Green" } else { "Yellow" })
Write-Host ""

# Show first few issues if any
if ($issues.Count -gt 0) {
    Write-Host "[!] Issues found:" -ForegroundColor Yellow
    $issues | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.File): $($_.Type) - $($_.Pattern)" -ForegroundColor Yellow
    }
    if ($issues.Count -gt 5) {
        Write-Host "   ... and $($issues.Count - 5) more" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] No critical issues found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Rebrand Jabar Bersuara SELESAI" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Cyan
