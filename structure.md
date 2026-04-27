PS X:\Project\FullStack-AddJob> tree /F
Folder PATH listing for volume 182
Volume serial number is 00000157 30B6:2486
X:.
│   .gitignore
│   conmmand.md
│   structure.md
│   
├───.sixth
│   └───skills
├───backend
│   │   package-lock.json
│   │   package.json
│   │   server.js
│   │   
│   └───src
│       │   app.js
│       │   
│       ├───config
│       │       cloudinary.js
│       │       db.js
│       │       email.js
│       │       googleDrive.js
│       │       
│       ├───controllers
│       │       application.controller.js
│       │       article.controller.js
│       │       auth.controller.js
│       │       company.controller.js
│       │       document.controller.js
│       │       job.controller.js
│       │       profile.controller.js
│       │       sales.controller.js
│       │       subscription.controller.js
│       │       
│       ├───middleware
│       │       auth.js
│       │       errorHandler.js
│       │       roleGuard.js
│       │       validate.js
│       │       
│       ├───models
│       │       Application.js
│       │       Article.js
│       │       Company.js
│       │       index.js
│       │       Job.js
│       │       ReferralTransaction.js
│       │       SeekerProfile.js
│       │       User.js
│       │       
│       ├───routes
│       │       application.routes.js
│       │       article.routes.js
│       │       auth.routes.js
│       │       company.routes.js
│       │       job.routes.js
│       │       profile.routes.js
│       │       sales.routes.js
│       │       subscription.routes.js
│       │       
│       ├───scripts
│       │       createIndexes.js
│       │       seed.js
│       │       
│       └───{config,middleware,models,routes,controllers}
└───frontend
    │   .env
    │   .env.example
    │   .env.production
    │   index.html
    │   package-lock.json
    │   package.json
    │   postcss.config.js
    │   tailwind.config.js
    │   vercel.json
    │   vite.config.js
    │   
    ├───public
    │   │   qris.png
    │   │   
    │   ├───banner
    │   │       banner1.png
    │   │       banner2.png
    │   │       banner3.png
    │   │       
    │   └───logo
    │           addjob-logo.png
    │           favicon.png
    │           
    └───src
        │   App.jsx
        │   main.jsx
        │   routes.jsx
        │   
        ├───components
        │   ├───common
        │   │       Avatar.jsx
        │   │       Badge.jsx
        │   │       BottomNav.jsx
        │   │       Button.jsx
        │   │       CompanyCard.jsx
        │   │       Footer.jsx
        │   │       Input.jsx
        │   │       JobCard.jsx
        │   │       Modal.jsx
        │   │       Navbar.jsx
        │   │       Skeleton.jsx
        │   │       WaveBackground.jsx
        │   │       
        │   ├───employer
        │   │       ApplicantCard.jsx
        │   │       DashboardStats.jsx
        │   │       JobPostForm.jsx
        │   │       
        │   └───seeker
        │           ApplicationCard.jsx
        │           index.js
        │           ProfileCard.jsx
        │           ResumeUpload.jsx
        │           
        ├───context
        │       AuthContext.jsx
        │       
        ├───hooks
        │       useApplications.js
        │       useAuth.js
        │       useJobs.js
        │       
        ├───layouts
        │       EmployerLayout.jsx
        │       PublicLayout.jsx
        │       SalesLayout.jsx
        │       SeekerLayout.jsx
        │       SuperAdminLayout.jsx
        │       
        ├───pages
        │   ├───auth
        │   │       ForgotPassword.jsx
        │   │       Login.jsx
        │   │       Register.jsx
        │   │       RoleSelect.jsx
        │   │       
        │   ├───employer
        │   │       Applicants.jsx
        │   │       CompanyProfile.jsx
        │   │       Dashboard.jsx
        │   │       EditJob.jsx
        │   │       MyJobs.jsx
        │   │       PostJob.jsx
        │   │       Subscription.jsx
        │   │       
        │   ├───public
        │   │       ArticleDetail.jsx
        │   │       Articles.jsx
        │   │       ComingSoon.jsx
        │   │       CompanyProfile.jsx
        │   │       JobDetail.jsx
        │   │       JobList.jsx
        │   │       Landing.jsx
        │   │       PreRegister.jsx
        │   │       Privacy.jsx
        │   │       Terms.jsx
        │   │       
        │   ├───sales
        │   │       Dashboard.jsx
        │   │       Login.jsx
        │   │       
        │   ├───seeker
        │   │       ApplyJob.jsx
        │   │       Coaching.jsx
        │   │       Dashboard.jsx
        │   │       JobList.jsx
        │   │       MyApplications.jsx
        │   │       Profile.jsx
        │   │       SavedJobs.jsx
        │   │       
        │   └───superadmin
        │           Dashboard.jsx
        │           Login.jsx
        │           
        ├───services
        │       api.js
        │       applicationService.js
        │       authService.js
        │       jobService.js
        │       
        ├───styles
        │       global.css
        │       
        └───utils
                formatters.js
                validators.js
                
PS X:\Project\FullStack-AddJob> 