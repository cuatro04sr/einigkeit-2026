Add-Type -AssemblyName System.Drawing
$res = @()
for ($i=1; $i -le 18; $i++) {
    $p = if ($i -eq 18) { "puzzle_piece.png" } else { "puzzle_piece-$i.png" }
    $path = "c:\Users\camil\Documents\Work\ASODECA\Dev Cuadros Aleman\public\backgrounds\mission\docs\fichas llenas\$p"
    if (Test-Path $path) {
        $img = [System.Drawing.Image]::FromFile($path)
        $res += "`"$i`":{`"w`":$($img.Width),`"h`":$($img.Height)}"
        $img.Dispose()
    }
}
"{" + ($res -join ",") + "}" | Out-File "sizes.json"
