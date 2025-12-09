# Deployment Guide

## Production Deployment Checklist

### Backend Deployment

#### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export PORT=5000
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/signature-engine"
```

#### 2. Build TypeScript
```bash
cd backend
npm install --production=false
npm run build
```

#### 3. Start Production Server
```bash
npm start
# Or use PM2 for process management
pm2 start dist/index.js --name signature-backend
```

#### 4. Recommended Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern platform with automatic deployments
- **DigitalOcean App Platform**: Scalable with managed databases
- **AWS EC2**: Full control, requires more setup

### Frontend Deployment

#### 1. Update Environment Variables
```bash
# .env.production
VITE_API_BASE_URL=https://your-api-domain.com/api
```

#### 2. Build for Production
```bash
cd frontend
npm install
npm run build
```

#### 3. Deploy `dist/` Folder
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist/` folder or use CLI
- **GitHub Pages**: Push `dist/` to gh-pages branch
- **AWS S3 + CloudFront**: Upload to S3, configure CloudFront

### MongoDB Setup

#### Option 1: MongoDB Atlas (Recommended)
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Whitelist your server IP
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in backend

#### Option 2: Self-Hosted
1. Install MongoDB on your server
2. Configure authentication
3. Set up backups
4. Update connection string

### CORS Configuration

Update `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### SSL/HTTPS

Both frontend and backend should use HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Most platforms (Vercel, Netlify, Heroku) provide automatic HTTPS

### Performance Optimization

#### Backend
- Enable gzip compression
- Set up caching headers
- Use CDN for signed PDFs
- Implement rate limiting

#### Frontend
- Code splitting (already done by Vite)
- Lazy load PDF viewer
- Optimize images
- Enable browser caching

### Monitoring & Logging

#### Backend
```bash
# Install monitoring tools
npm install winston morgan

# Add to index.ts
import winston from 'winston';
import morgan from 'morgan';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use(morgan('combined'));
```

### Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Enable CORS only for your domain
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use helmet.js for security headers
- [ ] Keep dependencies updated
- [ ] Enable MongoDB authentication
- [ ] Use strong passwords
- [ ] Implement file size limits

### Scaling Considerations

#### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Store signed PDFs in S3/Cloud Storage instead of local disk
- Use Redis for session management
- Implement queue system for PDF processing (Bull, RabbitMQ)

#### Database Scaling
- Enable MongoDB replica sets
- Implement database indexing
- Use connection pooling
- Consider sharding for large datasets

### CI/CD Pipeline

#### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

### Backup Strategy

#### Database Backups
```bash
# Automated daily backups
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb+srv://..." /backups/20231208
```

#### Signed PDFs
- Store in cloud storage (S3, Google Cloud Storage)
- Enable versioning
- Set up lifecycle policies
- Regular backups

### Cost Optimization

#### Free Tier Options
- **MongoDB Atlas**: 512MB free
- **Heroku**: 1 dyno free (limited hours)
- **Vercel**: Unlimited deployments
- **Netlify**: 100GB bandwidth/month

#### Paid Recommendations
- **MongoDB Atlas**: $9/month (M2 cluster)
- **Railway**: $5/month
- **Vercel Pro**: $20/month
- **AWS**: Pay as you go

### Health Checks

Add health check endpoint monitoring:
```typescript
// backend/src/routes/api.ts
router.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});
```

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

### Post-Deployment Testing

1. Test PDF upload and signing
2. Verify signature placement accuracy
3. Check responsive design on mobile
4. Test with different PDF sizes
5. Verify audit logs in MongoDB
6. Check error handling
7. Test CORS from frontend domain
8. Verify HTTPS certificates
9. Check performance (load time, API response)
10. Test backup and restore procedures

---

## Quick Deploy Commands

### Heroku (Backend)
```bash
heroku create your-app-name
heroku addons:create mongolab
git push heroku main
```

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway (Backend)
```bash
railway login
railway init
railway up
```

---

**Remember**: Always test in a staging environment before deploying to production!
