@echo off
echo Starting git operations...
git config core.pager cat
git add .
git commit -m "Modern UI with responsive design and MeshJS compatibility"
git pull origin main --no-edit --no-stat
git push origin main
echo Git operations complete!
