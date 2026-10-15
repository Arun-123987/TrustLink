# TrustLink — Poster Content (Current Repository Scope)

**Intelligent Worker Discovery and Trust Scoring Platform**  
*Find Trusted Workers Near You*

## 1. Problem
- Finding reliable local workers is difficult.
- Service quality, availability and pricing can be unclear.
- Local workers need better access to customers.

## 2. Solution
TrustLink connects customers with nearby service workers. Customers can discover workers, review profiles, request bookings and track job status. Workers can create profiles, manage availability and respond to job requests.

## 3. Objectives
- Help customers discover nearby service workers.
- Show worker skills, experience, rates and verification status.
- Support a transparent booking and job-status flow.
- Collect reviews after completed jobs.
- Explore ML-based worker scoring/recommendation.

## 4. Features visible in the current code
- Phone OTP authentication and role selection.
- Worker registration and profile editing.
- Nearby worker search using GPS coordinates, skill and radius.
- Worker profile details and reviews display.
- Booking request creation.
- Customer booking history and cancellation.
- Worker dashboard and availability control.
- Worker job requests: accept, reject and complete.
- Rating and review submission for completed bookings.
- Admin dashboard and worker verification/rejection.
- Python ML service endpoint for worker scoring/recommendation.

**Status note:** These features have corresponding files/routes in the repository, but file presence does not prove the complete end-to-end feature works. Test each flow before presenting it as fully completed.

## 5. Workflow
**Customer flow**  
Open TrustLink → Sign in with phone OTP → Choose Customer → Allow location → Search nearby workers → Open worker profile → Send booking request → View booking status → After completion, submit rating and review.

**Worker flow**  
Open TrustLink → Sign in with phone OTP → Choose Worker → Create profile and add skills/rates → Set availability → Receive job request → Accept or reject → Mark accepted job completed → Receive customer feedback.

**Admin flow**  
Admin sign-in → Open dashboard → Review pending workers → Verify or reject worker → Verified workers become eligible for discovery/booking, subject to availability and search filters.

## 6. System Architecture
React Native (Expo) Mobile App  
↕  
Node.js + Express REST API  
↔ MongoDB Database  
↔ Python ML Service (worker scoring/recommendation)  
Firebase: Phone authentication / notifications configuration

## 7. Technology Stack
- Frontend: React Native, Expo, Expo Router
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- ML service: Python, FastAPI, scikit-learn
- Authentication: Firebase phone authentication + backend tokens

## 8. Applications
Plumbing • Electrical work • Carpentry • Painting • Appliance repair and other local services.

## 9. Expected Impact
- Easier discovery of local service workers.
- Better visibility of worker skills and history.
- A clearer booking and review process.
- More opportunities for local workers.

## Avoid claiming as completed unless separately verified
Real-time in-app chat, push notifications functioning end-to-end, full GPS map pins, offline cache, ML fraud detection, demand prediction, payment integration, live tracking, voice/video calls and multilingual support are not established as working end-to-end by the currently reviewed code.
