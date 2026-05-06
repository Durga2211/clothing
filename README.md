# Prime Threads - Full Stack Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough to deploy the Prime Threads e-commerce platform so that it is accessible on the internet and data persists permanently across page refreshes.

The stack consists of:
- **Database:** MongoDB Atlas (Cloud Database)
- **Backend:** Render (Node.js/Express API)
- **Frontend:** Vercel (React/Vite App)

---

## Phase 1: Deploying the Database (MongoDB Atlas)

To ensure data (products, edits, etc.) persists, we need a cloud database.

1. **Create an Account:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2. **Create a Cluster:** 
   - Click **Build a Database** and select the **FREE (M0)** tier.
   - Choose a provider (e.g., AWS) and a region close to your users.
   - Click **Create Cluster**.
3. **Setup Security & Access:**
   - **Username & Password:** Create a database user (e.g., `admin`). Auto-generate a secure password and **save it somewhere safe**.
   - **Network Access:** Under "IP Access List", select **"Allow Access from Anywhere"** (this sets the IP to `0.0.0.0/0`), allowing Render to connect to it.
4. **Get the Connection String:**
   - Click **Connect** on your cluster dashboard.
   - Select **Drivers** (Node.js).
   - Copy the connection string provided. It will look like this:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
   - **Crucial Step:** Replace `<password>` with the password you generated in step 3 (remove the angle brackets). *Keep this URL handy for the Backend deployment.*

---

## Phase 2: Deploying the Backend API (Render)

We will host the Node.js API on Render, connecting it to the MongoDB database.

1. **Create an Account:** Go to [Render](https://render.com/) and sign up using your GitHub account.
2. **Create a New Web Service:**
   - Click **New +** and select **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect your GitHub account and select the `primethreads` repository you just pushed.
3. **Configure the Web Service:**
   - **Name:** `prime-threads-backend` (or similar)
   - **Root Directory:** `backend` *(⚠️ Very Important!)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Set Environment Variables:**
   - Scroll down to the **Environment Variables** section.
   - Click **Add Environment Variable**.
   - Key: `MONGODB_URI` | Value: *<Paste the MongoDB connection string from Phase 1>*
5. **Deploy:**
   - Click **Create Web Service**.
   - Render will build and start your app. Wait for the green "Live" status.
   - Copy the deployed **backend URL** provided by Render (e.g., `https://prime-threads-backend.onrender.com`). *Keep this handy for the Frontend deployment.*

*(Note: Once the frontend is deployed in Phase 3, we will come back to add the `FRONTEND_URL` variable here for secure CORS).*

---

## Phase 3: Deploying the Frontend (Vercel)

Finally, we deploy the React application.

1. **Create an Account:** Go to [Vercel](https://vercel.com/signup) and log in with GitHub.
2. **Import the Project:**
   - From the dashboard, click **Add New** -> **Project**.
   - Import your `primethreads` GitHub repository.
3. **Configure the Build:**
   - **Framework Preset:** Vercel should automatically detect **Vite**.
   - **Root Directory:** Click "Edit" and select `frontend` *(⚠️ Very Important!)*.
4. **Set Environment Variables:**
   - Open the **Environment Variables** dropdown.
   - Key: `VITE_API_URL` | Value: *<Paste the Render backend URL from Phase 2>* (e.g., `https://prime-threads-backend.onrender.com`)
   - *(Make sure there is no trailing slash `/` at the end of the URL)*
5. **Deploy:**
   - Click **Deploy**.
   - Vercel will build your frontend. Once complete, click **Continue to Dashboard** and click the **Visit** button to see your live site.
   - Copy the deployed **frontend URL** (e.g., `https://prime-threads.vercel.app`).

---

## Phase 4: Finalizing Security (CORS)

We need to tell the Backend to exclusively trust the deployed Frontend URL.

1. Go back to your [Render Dashboard](https://dashboard.render.com/) and open your backend web service.
2. Go to the **Environment** tab on the left.
3. Add a new variable:
   - Key: `FRONTEND_URL`
   - Value: *<Paste your Vercel frontend URL from Phase 3>*
4. Click **Save Changes**. (Render will automatically restart the backend).

---

## 🎉 You're Done!

Your full-stack application is now successfully deployed! 
- **Customer Storefront:** Visit your Vercel URL.
- **Admin Dashboard:** Visit `<your-vercel-url>/#/admin` to manage inventory. 
- **Data Persistence:** Any changes made in the admin dashboard are now permanently saved to your MongoDB Atlas database and will instantly reflect for anyone visiting your site!
