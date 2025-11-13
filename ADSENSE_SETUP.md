# Google AdSense Setup Guide

This guide will help you set up Google AdSense to monetize your Arma Reforger HOTAS Configurator.

## Step 1: Sign Up for Google AdSense

1. Go to [https://www.google.com/adsense](https://www.google.com/adsense)
2. Click "Get Started" and sign in with your Google account
3. Fill out the application form with your website URL and information
4. Wait for Google to review and approve your application (this can take a few days)

## Step 2: Get Your AdSense Code

Once approved:

1. Log in to your AdSense account
2. Navigate to **Ads** → **Overview**
3. Click **"Get code"** or look for your **Publisher ID** (starts with `ca-pub-`)

Your Publisher ID will look like: `ca-pub-1234567890123456`

## Step 3: Update the HTML File

Open `index.html` and replace the placeholder codes:

### Replace the Publisher ID (Line 10)

Find:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID.

### Replace Ad Slot IDs

There are two ad units in the file:

**Top Banner Ad (Line 24):**
```html
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
data-ad-slot="1234567890"
```

**Bottom Banner Ad (Line 99):**
```html
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
data-ad-slot="0987654321"
```

#### How to get Ad Slot IDs:

1. In AdSense, go to **Ads** → **By ad unit**
2. Click **"New ad unit"**
3. Choose **"Display ads"**
4. Name it (e.g., "HOTAS Config Top Banner")
5. Choose **"Responsive"** size
6. Click **"Create"**
7. Copy the `data-ad-slot` number from the generated code

Create two ad units:
- One for the top banner
- One for the bottom banner

Then replace the slot IDs in both locations in `index.html`.

## Step 4: Test Your Setup

1. Upload your files to your web server
2. Visit your website
3. You should see ad placeholders (blank ads may appear for new sites)
4. Use the AdSense dashboard to verify ads are loading correctly

## Important Notes

- **New sites**: Google may show blank ads for the first few hours/days while crawling your site
- **Policy compliance**: Ensure your site complies with [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- **Traffic**: You need real traffic to earn revenue - consider sharing your tool in Arma communities
- **Testing**: Don't click your own ads (Google will detect and ban you)

## Ad Placement

The configurator has ads placed in two non-intrusive locations:

1. **Top Banner**: Between the header and joystick status
2. **Bottom Banner**: After the main configuration area

Both are responsive and will adapt to different screen sizes.

## Troubleshooting

### Ads not showing?

- Check that you replaced ALL instances of `ca-pub-XXXXXXXXXXXXXXXX`
- Verify your AdSense account is approved and active
- Make sure you're not using an ad blocker
- Check browser console for errors
- Wait 24-48 hours for Google to crawl your site

### Need help?

- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community Forum](https://support.google.com/adsense/community)

## Revenue Tips

1. Share your tool in Arma Reforger communities and forums
2. Create a YouTube tutorial showing how to use it
3. Post on Reddit (r/armadev, r/arma)
4. Join Arma Discord servers and share (respectfully)
5. Consider SEO optimization for search engines

Good luck with monetization!
