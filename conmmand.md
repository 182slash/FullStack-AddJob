# Deploy
cd X:\Project\FullStack-AddJob
git add .
git commit -m "minor fix profile update button not funnctioning"
git push origin main

# Force Redeploy
git commit --allow-empty -m "retry deploy"
git push

