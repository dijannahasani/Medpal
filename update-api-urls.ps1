# PowerShell script to update all API URLs in frontend files
$files = Get-ChildItem -Path "frontend/src" -Recurse -Filter "*.jsx" -File

$filesUpdated = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Check if file has localhost:5000 references
    if ($content -match "http://localhost:5000") {
        
        # Check if API_URL import already exists
        $hasImport = $content -match 'import API_URL from'
        
        if (-not $hasImport) {
            # Determine the correct relative path for import
            $depth = ($file.DirectoryName.Replace((Get-Location).Path + "\frontend\src", "").Split("\") | Where-Object { $_ -ne "" }).Count
            $relativePath = if ($depth -eq 0) { "./config/api" } 
                           elseif ($depth -eq 1) { "../config/api" }
                           elseif ($depth -eq 2) { "../../config/api" }
                           elseif ($depth -eq 3) { "../../../config/api" }
                           else { "../config/api" }
            
            # Add import after the last import statement
            $content = $content -replace '(import[^;]+;)(\r?\n)(?!import)', "`$1`r`nimport API_URL from `"$relativePath`";`$2"
        }
        
        # Replace all occurrences of localhost:5000 with API_URL
        $before = ([regex]::Matches($content, "http://localhost:5000")).Count
        $content = $content -replace '"http://localhost:5000/', "`"`${API_URL}/"
        $content = $content -replace 'http://localhost:5000/', "`${API_URL}/"
        $content = $content -replace "'http://localhost:5000/", "'`${API_URL}/"
        $after = ([regex]::Matches($content, "http://localhost:5000")).Count
        
        $replacements = $before - $after
        
        if ($replacements -gt 0) {
            Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Updated $($file.Name): $replacements replacements" -ForegroundColor Green
            $filesUpdated++
            $totalReplacements += $replacements
        }
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "Files updated: $filesUpdated" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow

