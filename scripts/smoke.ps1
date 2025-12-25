$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3000'

$paths = @(
  '/',
  '/vi',
  '/en',
  '/menu/product',
  '/vi/menu/product',
  '/menu/industrial',
  '/vi/menu/industrial',
  '/blog',
  '/vi/blog',
  '/contact',
  '/vi/contact',
  '/envision',
  '/vi/envision',
  '/engage',
  '/vi/engage',
  '/entrench',
  '/vi/entrench',
  '/login',
  '/register',
  '/admin',
  '/admin/products',
  '/admin/blog',
  '/admin/contacts',
  '/admin/users',
  '/admin/settings',
  '/admin/product-groups',
  '/api/product-groups',
  '/api/products'
)

function Test-Url($url, $label) {
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 0
    Write-Host ("OK  {0}  {1}" -f [int]$resp.StatusCode, $label)
    return $true
  } catch {
    $ex = $_.Exception
    $r = $null
    if ($ex -and $ex.PSObject.Properties.Match('Response').Count -gt 0) {
      $r = $ex.Response
    }

    if ($r -and $r.PSObject.Properties.Match('StatusCode').Count -gt 0) {
      Write-Host ("ERR {0}  {1}" -f [int]$r.StatusCode, $label)
    } else {
      Write-Host ("ERR --- {0}  {1}" -f ($ex.GetType().Name), $label)
    }
    return $false
  }
}

Write-Host ("Smoke test base: {0}" -f $base)
$failed = 0

foreach ($p in $paths) {
  $ok = Test-Url ($base + $p) $p
  if (-not $ok) { $failed++ }
}

if ($failed -gt 0) {
  Write-Host ("`nFAILED: {0} endpoints" -f $failed)
  exit 1
}

Write-Host "`nALL OK"


