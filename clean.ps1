Set-Location C:\swiftmatch1
$staged = (git diff --cached --name-only) | Where-Object { $_ -match '\.(txt|sh)$' }
foreach ($f in $staged) {
  git restore --staged -- "$f"
  if (Test-Path -LiteralPath $f) {
    Remove-Item -LiteralPath $f -Force
  }
}
