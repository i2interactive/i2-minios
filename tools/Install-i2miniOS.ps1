<#
  i2 miniOS - make a kid's Windows account boot straight into i2 miniOS (Windows 10/11 Home or Pro)
  by i2 interactive - https://i2interactive.com/ - MIT license                       [setup script v5]

  Run once from your ADMIN account, in an admin terminal:
    powershell -ExecutionPolicy Bypass -File C:\i2miniOS\Install-i2miniOS.ps1 -KidUser <WindowsAccountName> -AutoLogon -DisableWinKey

  Options
    -KidUser <name>    the kid's local Windows account (required)
    -AppDir <path>     folder holding i2 miniOS (default: C:\i2miniOS)
    -Html <path>       the i2 miniOS .html file (default: i2minios.html in -AppDir, else the newest .html there)
    -AutoLogon         prepares auto sign-in (then finish it in netplwiz - the script tells you how)
    -DisableWinKey     turn off both Windows keys on this laptop (all accounts)
    -Check             print what is set up (and why it might not be working), then open i2 miniOS once here
    -Uninstall         undo everything this script set up

  What it does
    1. Writes <AppDir>\launch.ps1: opens i2 miniOS full screen in its own Edge window and
       reopens it within a few seconds if it is ever closed (Alt+F4, crash, update).
    2. Adds an "i2 miniOS" shortcut to the Startup folder for all accounts; the launcher quits
       right away for anyone except the kid, and keeps a log at %LOCALAPPDATA%\i2miniOS\launch.log.
    3. Removes old "--kiosk" startup shortcuts (kiosk mode is InPrivate and forgets
       progress, stickers, recordings and API keys every time Edge closes).
    4. Edge policies: no first-run, no sign-in or sync popups, no sidebar or shopping popups,
       camera and mic allowed for the local file (Show Me, Color Hunt, Mirror, Family Voices).
    5. No touchscreen edge swipes, no lock screen after sleep, and no notifications for the kid.
    6. Optional: auto sign-in and Windows-key disable.

  Updating a laptop that ran the pre-release build: run this once. It moves that build's Edge profile
  (where all progress lives) to the new folder name and removes its old start-up entries, so nothing is lost.
#>
param(
  [string]$KidUser = '',
  [string]$AppDir = 'C:\i2miniOS',
  [string]$Html = '',
  [switch]$AutoLogon,
  [switch]$DisableWinKey,
  [switch]$Check,
  [switch]$Uninstall
)
$ErrorActionPreference = 'Stop'
function Say([string]$m, [string]$c = 'Cyan') { Write-Host $m -ForegroundColor $c }

$me = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { Say 'Please run this from an Administrator terminal (right-click Start > Terminal (Admin)).' 'Red'; exit 1 }

$AppName    = 'i2 miniOS'
$ProfName   = 'i2miniOS'                 # %LOCALAPPDATA%\i2miniOS\Edge holds the Edge profile, so all progress and settings
$ExitFlag   = 'i2minios-exit'            # 'Exit to Windows' in Grown-Ups downloads i2minios-exit.txt
$TaskName   = $AppName
$StartupLnk = Join-Path $env:ProgramData "Microsoft\Windows\Start Menu\Programs\StartUp\$AppName.lnk"
# names used by the pre-release build, only so an upgrade can carry its data over and tidy up after it
$Legacy     = @{ Task = 'OTTO OS'; Lnk = (Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs\StartUp\OTTO OS.lnk'); Prof = 'OttoOS' }
$EdgePol   = 'HKLM:\SOFTWARE\Policies\Microsoft\Edge'
$Winlogon  = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
$KbdKey    = 'HKLM:\SYSTEM\CurrentControlSet\Control\Keyboard Layout'
$EdgeUI    = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\EdgeUI'
$PwLess    = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device'
$EdgeDword = [ordered]@{
  HideFirstRunExperience = 1; StartupBoostEnabled = 0; BackgroundModeEnabled = 0; BrowserSignin = 0; SyncDisabled = 1
  PasswordManagerEnabled = 0; TranslateEnabled = 0; ShowRecommendationsEnabled = 0; HubsSidebarEnabled = 0
  EdgeShoppingAssistantEnabled = 0; PromptForDownloadLocation = 0; AutoplayAllowed = 1
}
$EdgeLists = @('VideoCaptureAllowedUrls', 'AudioCaptureAllowedUrls')

function Set-Reg([string]$path, [string]$name, $value, [string]$type = 'DWord') {
  if (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
  New-ItemProperty -Path $path -Name $name -Value $value -PropertyType $type -Force | Out-Null
}
function Remove-Reg([string]$path, [string]$name) { Remove-ItemProperty -Path $path -Name $name -ErrorAction SilentlyContinue }

# ---------- the kid account ----------
if (-not $KidUser) { Say 'Tell me which Windows account is the kid''s: run again with -KidUser <name>. Accounts on this PC:' 'Red'; Get-LocalUser | Where-Object Enabled | ForEach-Object { Say ('  ' + $_.Name) 'Yellow' }; exit 1 }
$kid = Get-LocalUser -Name $KidUser -ErrorAction SilentlyContinue
if (-not $kid) { Say "There is no local account called '$KidUser'. Run again with -KidUser <name>. Accounts on this PC:" 'Red'; Get-LocalUser | Where-Object Enabled | ForEach-Object { Say ('  ' + $_.Name) 'Yellow' }; exit 1 }
$sid = $kid.SID.Value
$profilePath = (Get-CimInstance Win32_UserProfile | Where-Object { $_.SID -eq $sid } | Select-Object -First 1).LocalPath

function With-KidHive([scriptblock]$work) {
  # run $work against the kid's HKCU (loads their registry hive if they are signed out)
  $loaded = $false; $root = "Registry::HKEY_USERS\$sid"
  if (-not (Test-Path $root)) {
    if (-not $profilePath) { Say "  (skipped: sign in to '$KidUser' once, then run this again to also turn off notifications)" 'Yellow'; return }
    & reg.exe load "HKU\i2miniOSKidTmp" (Join-Path $profilePath 'NTUSER.DAT') | Out-Null
    $loaded = $true; $root = 'Registry::HKEY_USERS\i2miniOSKidTmp'
  }
  try { & $work $root } finally { if ($loaded) { [GC]::Collect(); [GC]::WaitForPendingFinalizers(); Start-Sleep -Milliseconds 500; & reg.exe unload "HKU\i2miniOSKidTmp" | Out-Null } }
}

# ================= UNINSTALL =================
if ($Uninstall) {
  foreach ($t in @($TaskName, $Legacy.Task)) { Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue }
  foreach ($l in @($StartupLnk, $Legacy.Lnk)) { Remove-Item -LiteralPath $l -Force -ErrorAction SilentlyContinue }
  foreach ($k in $EdgeDword.Keys) { Remove-Reg $EdgePol $k }
  foreach ($k in $EdgeLists) { Remove-Item -Path "$EdgePol\$k" -Recurse -Force -ErrorAction SilentlyContinue }
  Remove-Reg $EdgeUI 'AllowEdgeSwipe'
  Remove-Reg $KbdKey 'Scancode Map'
  Set-Reg $Winlogon 'AutoAdminLogon' '0' 'String'; Remove-Reg $Winlogon 'DefaultPassword'
  & powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_NONE CONSOLELOCK 1; & powercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_NONE CONSOLELOCK 1; & powercfg /SETACTIVE SCHEME_CURRENT
  try { With-KidHive { param($r) Remove-Reg "$r\Software\Microsoft\Windows\CurrentVersion\PushNotifications" 'ToastEnabled' } } catch {}
  Say 'i2 miniOS boot setup removed (progress stays in the Edge profile). Restart the laptop to finish.' 'Green'
  exit 0
}

# ================= CHECK =================
if ($Check) {
  $ok = { param($b, $msg) if ($b) { Say "  OK   $msg" 'Green' } else { Say "  ??   $msg" 'Yellow' } }
  Say "Account '$KidUser'"
  & $ok ($kid.PrincipalSource -ne 'MicrosoftAccount') "type: $($kid.PrincipalSource) (auto sign-in only works for a Local account with no password)"
  $isAdmin = $false; try { $isAdmin = [bool](Get-LocalGroupMember -Group Administrators -ErrorAction Stop | Where-Object { $_.SID -and $_.SID.Value -eq $sid }) } catch {}
  & $ok (-not $isAdmin) "standard (not admin) account"
  & $ok ([bool]$profilePath) "has signed in at least once ($profilePath)"
  Say 'Start-up'
  & $ok (Test-Path -LiteralPath $StartupLnk) "startup shortcut: $StartupLnk"
  & $ok (Test-Path (Join-Path $AppDir 'launch.ps1')) "launcher: $(Join-Path $AppDir 'launch.ps1')"
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) { Say "  --   old scheduled task '$TaskName' still exists (installing again removes it)" 'Yellow' }
  if ($profilePath) {
    $log = Join-Path $profilePath "AppData\Local\$ProfName\launch.log"
    if (Test-Path $log) { Say "  last lines of $($log):"; Get-Content $log -Tail 8 | ForEach-Object { Say "       $_" 'Gray' } } else { Say "  --   no launch log yet (the launcher has never run in $KidUser's account)" 'Yellow' }
  }
  Say 'Auto sign-in'
  $w = Get-ItemProperty $Winlogon
  & $ok ($w.AutoAdminLogon -eq '1') "AutoAdminLogon = $($w.AutoAdminLogon)"
  & $ok ($w.DefaultUserName -eq $KidUser) "DefaultUserName = $($w.DefaultUserName)"
  $pl = (Get-ItemProperty $PwLess -ErrorAction SilentlyContinue).DevicePasswordLessBuildVersion
  & $ok ($pl -eq 0) "Windows Hello-only sign-in off (DevicePasswordLessBuildVersion = $pl)"
  Say 'Opening i2 miniOS here once with the same settings, to test Edge...'
  $launch = Join-Path $AppDir 'launch.ps1'
  if (Test-Path $launch) { $t = Get-Content $launch -Raw; $e = [regex]::Match($t, "\`$edge = '([^']+)'").Groups[1].Value; $u = [regex]::Match($t, "\`$url  = '([^']+)'").Groups[1].Value
    Say "  Edge: $e"; Say "  Page: $u"
    Start-Process -FilePath $e -ArgumentList @("--app=$u", '--start-fullscreen', "--user-data-dir=`"$env:TEMP\i2miniOS-test`"", '--no-first-run') }
  exit 0
}

# ================= INSTALL =================
# find the i2 miniOS file: -Html if given (with or without .html), else i2minios.html, else the newest .html in the folder
$page = $null
if ($Html) { foreach ($c in @($Html, "$Html.html", (Join-Path $AppDir $Html), (Join-Path $AppDir "$Html.html"))) { if (Test-Path -LiteralPath $c -PathType Leaf) { $page = (Resolve-Path -LiteralPath $c).Path; break } } }
if (-not $page -and (Test-Path -LiteralPath (Join-Path $AppDir 'i2minios.html'))) { $page = (Resolve-Path -LiteralPath (Join-Path $AppDir 'i2minios.html')).Path }
if (-not $page) { $f = Get-ChildItem -Path $AppDir -Filter *.html -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1; if ($f) { $page = $f.FullName } }
if (-not $page) { Say "Can't find an .html file in $AppDir. Put i2minios.html there first. Files there:" 'Red'; Get-ChildItem -Path $AppDir -ErrorAction SilentlyContinue | ForEach-Object { Say ('  ' + $_.Name) 'Yellow' }; exit 1 }
Say "Using $page"
if ($page -match "[ '#%]") { $safe = Join-Path (Split-Path $page) 'i2minios.html'; Copy-Item -LiteralPath $page -Destination $safe -Force; $page = $safe; Say "  (copied to $safe so the path has no spaces or special characters)" 'Yellow' }
$admins = $null; try { $admins = Get-LocalGroupMember -Group Administrators -ErrorAction Stop | Where-Object { $_.SID -and $_.SID.Value -eq $sid } } catch {}
if ($admins) { Say "Heads-up: '$KidUser' is an Administrator. Make it a Standard account (Settings > Accounts > Other users)." 'Yellow' }

$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { Say 'Microsoft Edge was not found.' 'Red'; exit 1 }
$url = 'file:///' + ($page -replace '\\', '/')

# upgrading from the pre-release build: its Edge profile holds all progress, so move it under the new name (once)
if ($profilePath) {
  $oldProf = Join-Path $profilePath ('AppData\Local\' + $Legacy.Prof); $newProf = Join-Path $profilePath "AppData\Local\$ProfName"
  if ((Test-Path $oldProf) -and -not (Test-Path $newProf)) {
    try { Move-Item -LiteralPath $oldProf -Destination $newProf -ErrorAction Stop; Say "Moved the existing progress to $newProf" 'Green' }
    catch { Say "Could not move $oldProf (is the kid signed in with Edge open?). Sign them out and run this again so their progress carries over." 'Red'; exit 1 }
  }
}
foreach ($t in @($Legacy.Task)) { Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue }
Remove-Item -LiteralPath $Legacy.Lnk -Force -ErrorAction SilentlyContinue

Say '1/6  Writing the launcher...'
$launcher = Join-Path $AppDir 'launch.ps1'
$launchText = @"
# i2 miniOS launcher - runs when '$KidUser' signs in. Keeps i2 miniOS open, full screen.
`$edge = '$edge'
`$url  = '$url'
if (`$env:USERNAME -ne '$KidUser') { exit }
`$prof = Join-Path `$env:LOCALAPPDATA '$ProfName\Edge'
`$log  = Join-Path `$env:LOCALAPPDATA '$ProfName\launch.log'
New-Item -ItemType Directory -Path (Split-Path `$log) -Force | Out-Null
function Log(`$m) { Add-Content -Path `$log -Value ((Get-Date -Format 's') + '  ' + `$m) }
Log 'launcher started'
`$edgeArgs = @("--app=`$url", '--start-fullscreen', "--user-data-dir=```"`$prof```"", '--no-first-run', '--hide-crash-restore-bubble',
  '--overscroll-history-navigation=0', '--disable-pinch', '--autoplay-policy=no-user-gesture-required', '--disable-features=Translate')
`$dl = `$null; try { `$dl = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path } catch {}
if (-not `$dl) { `$dl = Join-Path `$env:USERPROFILE 'Downloads' }
Get-ChildItem -Path `$dl -Filter '$ExitFlag*.txt' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
while (`$true) {
  # 'Exit to Windows' in Grown-Ups drops $ExitFlag.txt in Downloads: stop reopening until the next sign-in
  `$flag = Get-ChildItem -Path `$dl -Filter '$ExitFlag*.txt' -ErrorAction SilentlyContinue
  if (`$flag) { `$flag | Remove-Item -Force -ErrorAction SilentlyContinue; Log 'exit to Windows requested'; break }
  `$running = Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" -ErrorAction SilentlyContinue | Where-Object { `$_.CommandLine -like '*$ProfName*' }
  if (-not `$running) { try { Start-Process -FilePath `$edge -ArgumentList `$edgeArgs; Log 'opened i2 miniOS' } catch { Log ('could not open Edge: ' + `$_.Exception.Message) }; Start-Sleep -Seconds 10 }
  Start-Sleep -Seconds 3
}
"@
Set-Content -Path $launcher -Value $launchText -Encoding ASCII

Say '2/6  Starting i2 miniOS whenever the kid signs in...'
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
$ws = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut($StartupLnk)
$lnk.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$lnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcher`""
$lnk.WorkingDirectory = $AppDir; $lnk.WindowStyle = 7; $lnk.Save()

Say '3/6  Removing the old kiosk startup shortcut...'
if ($profilePath) {
  $startup = Join-Path $profilePath 'AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup'
  if (Test-Path $startup) {
    $sh = New-Object -ComObject WScript.Shell
    Get-ChildItem -Path $startup -Filter *.lnk | ForEach-Object { $l = $sh.CreateShortcut($_.FullName); if ($l.TargetPath -like '*msedge*') { Remove-Item $_.FullName -Force; Say ('     removed ' + $_.Name) 'Yellow' } }
  }
}

Say '4/6  Edge settings (no popups; camera and mic allowed for i2 miniOS)...'
foreach ($k in $EdgeDword.Keys) { Set-Reg $EdgePol $k $EdgeDword[$k] }
foreach ($k in $EdgeLists) { Set-Reg "$EdgePol\$k" '1' 'file:///*' 'String' }

Say '5/6  Touchscreen, sleep and notifications...'
Set-Reg $EdgeUI 'AllowEdgeSwipe' 0
& powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_NONE CONSOLELOCK 0; & powercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_NONE CONSOLELOCK 0; & powercfg /SETACTIVE SCHEME_CURRENT
try { With-KidHive { param($r) Set-Reg "$r\Software\Microsoft\Windows\CurrentVersion\PushNotifications" 'ToastEnabled' 0 } } catch { Say ('     notifications: ' + $_.Exception.Message) 'Yellow' }

Say '6/6  Options...'
if ($AutoLogon) {
  # Windows 11 is picky about auto sign-in set straight in the registry (it can show a duplicate
  # account and fall back to the sign-in screen). So: only unhide the netplwiz checkbox here,
  # clear any half-set registry auto sign-in, and let netplwiz store the password properly.
  Set-Reg $PwLess 'DevicePasswordLessBuildVersion' 0
  Set-Reg $Winlogon 'AutoAdminLogon' '0' 'String'; Remove-Reg $Winlogon 'DefaultPassword'
  Say "     Auto sign-in: restart once, give '$KidUser' a simple password (net user $KidUser <password>)," 'Green'
  Say "     then Win+R > netplwiz > pick $KidUser > untick 'Users must enter a user name and password' > Apply." 'Green'
}
if ($DisableWinKey) {
  [byte[]]$map = 0,0,0,0, 0,0,0,0, 3,0,0,0, 0,0,0x5B,0xE0, 0,0,0x5C,0xE0, 0,0,0,0
  Set-Reg $KbdKey 'Scancode Map' $map 'Binary'
  Say '     Windows keys are off (all accounts; -Uninstall turns them back on)' 'Green'
}

Say ''
Say "Done. Restart the laptop. It should sign in to '$KidUser' and open i2 miniOS full screen." 'Green'
Say 'Your way out: Ctrl+Alt+Del > Switch user (or Sign out) > your admin account.' 'Green'
Say 'If you used -AutoLogon: hold Shift while Windows starts (or after signing out) to stop the auto sign-in once.' 'Green'
Say 'First time on the new setup: re-enter your API keys in Grown-Ups (hold Hoot 3 s). Use Backup there now and then.' 'Green'
