$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:10000/")
try {
    $listener.Start()
    Write-Host "Server started. Access at http://localhost:10000/"
} catch {
    Write-Error $_
    exit 1
}

# Main Loop to handle HTTP traffic
while ($listener.IsListening) {
    $response = $null
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        # Use native System.Uri to unescape URL, avoiding un-imported System.Web assemblies
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        
        if ($urlPath -eq "/" -or $urlPath -eq "") { 
            $urlPath = "/index.html" 
        }
        
        # Remove leading slash for Join-Path
        $cleanPath = $urlPath.TrimStart('/')
        $filePath = Join-Path (Get-Location) $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            
            if ($extension -eq ".html" -or $extension -eq ".htm") { $contentType = "text/html; charset=utf-8" }
            elseif ($extension -eq ".css") { $contentType = "text/css; charset=utf-8" }
            elseif ($extension -eq ".js") { $contentType = "text/javascript; charset=utf-8" }
            elseif ($extension -eq ".json") { $contentType = "application/json; charset=utf-8" }
            elseif ($extension -eq ".png") { $contentType = "image/png" }
            elseif ($extension -eq ".jpg" -or $extension -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($extension -eq ".gif") { $contentType = "image/gif" }
            elseif ($extension -eq ".svg") { $contentType = "image/svg+xml; charset=utf-8" }
            elseif ($extension -eq ".ico") { $contentType = "image/x-icon" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $urlPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
    } catch {
        # Catch and log connection/processing errors without stopping the listener loop
        Write-Host "Error serving request: $_"
    } finally {
        # CRITICAL: Always close the response to prevent client connection hang
        if ($null -ne $response) {
            try {
                $response.Close()
            } catch {
                # Ignore errors during closing
            }
        }
    }
}
