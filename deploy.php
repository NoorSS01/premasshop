<?php
// Deployment script for Hostinger
echo "Starting deployment...\n";

// Execute build script
shell_exec('chmod +x build.sh');
$output = shell_exec('./build.sh 2>&1');

echo $output;

// Move files to public_html if they exist
if (file_exists('frontend/dist/index.html')) {
    echo "Moving files to public_html...\n";
    shell_exec('cp -r frontend/dist/* public_html/ 2>&1');
    shell_exec('cp frontend/public/.htaccess public_html/ 2>&1');
    echo "Files moved successfully!\n";
} else {
    echo "Build failed - dist folder not found!\n";
}

echo "Deployment completed!\n";
?>
