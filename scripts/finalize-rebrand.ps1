$ErrorActionPreference = 'Stop'
$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

function Read-Utf8 {
    param([string]$Path)
    Get-Content -Path $Path -Raw -Encoding UTF8
}

function Write-Utf8 {
    param(
        [string]$Path,
        [string]$Content
    )
    Set-Content -Path $Path -Value $Content -Encoding UTF8 -NoNewline
}

function Normalize-Characters {
    param([string]$Text)

    $Text = $Text.Replace([string][char]0x201C, '"').Replace([string][char]0x201D, '"')
    $Text = $Text.Replace([string][char]0x2018, "'").Replace([string][char]0x2019, "'")
    $Text = $Text.Replace([string][char]0x2013, '-').Replace([string][char]0x2014, '-')
    $Text = $Text.Replace([string][char]0x00A0, ' ').Replace([string][char]0xFFFD, ' ')

    return $Text
}

$newBrand = 'Jabar Bersuara'
$newMail = 'jabarbersuara@gmail.com'
$newHandle = 'jabarbersuara'
$legacyBrandNames = @(
    ('Warta' + ' Janten'),
    ('Warta' + 'Janten'),
    ('warta' + 'janten')
)

$stats = [ordered]@{
    'Main pages'   = 0
    'Article pages' = 0
    'CSS'          = 0
    'Package'      = 0
    'Docs'         = 0
}

$regexOptions = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline

# Backup articles.json -> articles.json.bak
$articlesJson = Join-Path $WorkspaceRoot 'articles.json'
if (Test-Path $articlesJson) {
    Copy-Item $articlesJson (Join-Path $WorkspaceRoot 'articles.json.bak') -Force
    Write-Host 'Backup created: articles.json.bak'
}

# CSS theme + text logo styling
$cssBlock = @'

.brand-logo{display:inline-flex;align-items:flex-end;gap:2px;line-height:1;white-space:nowrap}
.brand-logo-main{font-weight:700;color:#0EA5E9;font-size:24px;letter-spacing:-0.5px}
.brand-logo-sub{font-weight:500;color:#1F5F1F;font-size:18px;letter-spacing:.2px}
.navbar-brand:hover .brand-logo-main,.navbar-brand:hover .brand-logo-sub{text-decoration:none}
'@

@(
    (Join-Path $WorkspaceRoot 'css\style.css'),
    (Join-Path $WorkspaceRoot 'css\style.min.css')
) | ForEach-Object {
    if (-not (Test-Path $_)) { return }

    $content = Read-Utf8 $_
    $original = $content

    $content = $content.Replace('#FFCC00', '#0EA5E9').Replace('#1E2024', '#075985')
    if ($content -notmatch 'brand-logo-main') {
        $content += $cssBlock
    }

    if ($content -ne $original) {
        Write-Utf8 $_ $content
        $stats['CSS']++
    }
}

# HTML cleanup and standardization
Get-ChildItem -Path $WorkspaceRoot -Recurse -Include *.html -File |
    Where-Object { $_.FullName -notlike '*\node_modules\*' -and $_.FullName -notlike '*\.bak*' } |
    ForEach-Object {
        $file = $_
        $content = Read-Utf8 $file.FullName
        $original = $content
        $isArticle = $file.FullName -like '*\article\*'
        $homeHref = if ($isArticle) { '../index.html' } else { 'index.html' }

        $logoMarkup = @"
<a href="$homeHref" class="navbar-brand mr-5">
            <span class="brand-logo"><span class="brand-logo-main">JABAR</span><span class="brand-logo-sub">BERSUARA</span></span>
        </a>
"@

        $content = Normalize-Characters $content

        foreach ($legacyName in $legacyBrandNames) {
            $content = $content.Replace($legacyName, $newBrand)
        }

        $content = $content.Replace('jabarbersuara@googlemail.com', $newMail)
        $content = $content.Replace('test@example.com', $newMail)
        $content = [regex]::Replace($content, '(?i)(https://(?:www\.)?facebook\.com/)[A-Za-z0-9_.-]+', '$1' + $newHandle)
        $content = [regex]::Replace($content, '(?i)(https://(?:www\.)?twitter\.com/)[A-Za-z0-9_.-]+', '$1' + $newHandle)
        $content = [regex]::Replace($content, '(?i)(https://(?:www\.)?instagram\.com/)[A-Za-z0-9_.-]+', '$1' + $newHandle)
        $content = [regex]::Replace($content, '(?i)(https://(?:www\.)?youtube\.com/@)[A-Za-z0-9_.-]+', '$1' + $newHandle)
        $content = [regex]::Replace($content, '<title>(?!.*Jabar Bersuara)(.*?)</title>', '<title>$1 - Jabar Bersuara</title>')

        $brandPattern = '<a\s+href="[^"]*index\.html"[^>]*class="[^"]*navbar-brand[^"]*"[^>]*>\s*(?:<img[^>]*>|<span[^>]*>.*?BERSUARA.*?</span>)\s*</a>'
        $content = [regex]::Replace(
            $content,
            $brandPattern,
            [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $logoMarkup.Trim() },
            $regexOptions
        )

        if ($content -ne $original) {
            Write-Utf8 $file.FullName $content
            if ($isArticle) {
                $stats['Article pages']++
            } else {
                $stats['Main pages']++
            }
        }
    }

# Package metadata enforcement
$packageTargets = @{
    (Join-Path $WorkspaceRoot 'package.json') = 'jabarbersuara'
    (Join-Path $WorkspaceRoot 'tools\package.json') = 'jabarbersuara-article-generator'
}

foreach ($packagePath in $packageTargets.Keys) {
    if (-not (Test-Path $packagePath)) { continue }

    $content = Read-Utf8 $packagePath
    $original = $content
    $content = [regex]::Replace($content, '"name"\s*:\s*"[^"]+"', '"name": "' + $packageTargets[$packagePath] + '"', 1)

    if ($content -ne $original) {
        Write-Utf8 $packagePath $content
        $stats['Package']++
    }
}

# Documentation refresh
@(
    (Join-Path $WorkspaceRoot 'AUTOMATION_README.md'),
    (Join-Path $WorkspaceRoot 'GOOGLE_DRIVE_GUIDE.md'),
    (Join-Path $WorkspaceRoot 'netlify.toml')
) | ForEach-Object {
    if (-not (Test-Path $_)) { return }

    $content = Read-Utf8 $_
    $original = $content

    foreach ($legacyName in $legacyBrandNames) {
        $content = $content.Replace($legacyName, $newBrand)
    }
    $content = $content.Replace('jabarbersuara@googlemail.com', $newMail)

    if ($content -ne $original) {
        Write-Utf8 $_ $content
        $stats['Docs']++
    }
}

Write-Host ''
Write-Host 'Files updated:'
$stats.GetEnumerator() | ForEach-Object {
    Write-Host ('- {0}: {1}' -f $_.Key, $_.Value)
}
Write-Host ''
Write-Host 'Rebrand Jabar Bersuara selesai ✅'
