# Changelog

All notable changes to Churn Prediction AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added
- Initial release of Churn Prediction AI platform
- Three ML model implementations (PyCaret LR, H2O AutoML, Gradient Boosting Ensemble)
- Real-time single customer prediction
- Bulk CSV upload and batch processing
- Comprehensive analytics dashboard with model comparison
- Prediction history with search and filtering
- About page with complete project documentation
- Premium Netflix-inspired UI with glassmorphism effects
- Supabase integration for prediction storage
- FastAPI serverless backend on Vercel
- React + TypeScript frontend with Vite
- Responsive mobile design
- Model performance comparison graphs
- Feature importance analysis
- Churn pattern visualizations
- Risk driver identification
- Retention strategy suggestions

### Documentation
- Comprehensive README.md
- DEPLOYMENT.md with step-by-step deployment guide
- ARCHITECTURE.md explaining system design
- API_DOCUMENTATION.md with endpoint details
- CONTRIBUTING.md with contribution guidelines
- QUICK_START.md for fast setup
- PROJECT_CHECKLIST.md for GitHub push readiness
- Supabase schema SQL file
- Setup scripts for Windows and Linux/Mac
- GitHub issue templates
- CI/CD workflow configuration

### Infrastructure
- Vercel deployment configuration
- Supabase PostgreSQL schema
- Environment variable management
- .gitignore for security
- Sample CSV template
- MIT License

## [Unreleased]

### Planned Features
- Real ML model loading (replace rule-based inference)
- User authentication with Supabase Auth
- Export predictions to CSV/Excel
- Email notifications for high-risk customers
- A/B testing framework
- Model retraining pipeline
- Advanced analytics (cohort analysis, retention curves)
- Multi-tenant support
- Real-time streaming predictions
- Custom model training UI
- CRM system integrations
- Mobile app (React Native)

### Planned Improvements
- Unit and integration tests
- E2E testing with Playwright
- Performance optimizations
- Caching layer (Redis)
- Rate limiting
- API versioning
- WebSocket support for real-time updates
- Dark/light theme toggle
- Internationalization (i18n)
- Accessibility improvements

### Known Issues
- Dashboard stats show default values when no predictions exist
- History page requires at least one prediction to display data
- Model inference uses rule-based logic (demo purposes)
- No authentication system yet
- Limited error messages for API failures

---

## Version History

- **1.0.0** - Initial production-ready release
- **0.1.0** - Development version (internal)

## Contributors

- Your Name - Initial work

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/yourusername/churn-prediction-ai/issues) page.
