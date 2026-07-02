import { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'orangehrm',
    title: 'OrangeHRM Demo Dashboard',
    framework: 'playwright-ts',
    description: 'Verify login, dashboard presence, sidebar navigation, and user admin list.',
    criteria: `Go to the OrangeHRM Live Demo login page (https://opensource-demo.orangehrmlive.com).
Log in using Username 'Admin' and Password 'admin123'.
Verify that the Dashboard title header is visible and displayed on screen.
Locate the side navigation bar and click on the 'Admin' menu item.
Once the Admin section loads, assert that the system users table is present and lists at least one row.`
  },
  {
    id: 'saucedemo',
    title: 'SauceLabs Cart & Checkout',
    framework: 'playwright-js',
    description: 'Login, sorting, cart assertion, mock checkout form validation, and finish order.',
    criteria: `Navigate to SauceDemo (https://www.saucedemo.com).
Log in with 'standard_user' and password 'secret_sauce'.
Sort the inventory list items by Price (High to Low).
Add the first product (the most expensive one) to the cart.
Click the shopping cart link to navigate to the cart review screen.
Verify the product name match and click 'Checkout'.
Fill in first name 'John', last name 'Doe', and zip code '90210'.
Click 'Continue', then on the final summary screen click 'Finish'.
Confirm that the success header 'Thank you for your order!' is visible.`
  },
  {
    id: 'apimocking',
    title: 'API Stubbing & Error Handling',
    framework: 'cypress',
    description: 'Intercept network requests, mock success JSON, mock server 500 error states.',
    criteria: `Visit the local dashboard app profile page (/dashboard/profile).
Intercept the API GET request to '/api/v1/user/profile'.
Stub the request to return status 200 with JSON payload: { "id": 101, "name": "Sarah Miller", "role": "Automation Lead", "avatar": "/sarah.jpg" }.
Verify that the UI updates to show 'Sarah Miller' and her role as 'Automation Lead' within the profile card.
Next, mock the same GET request to return a 500 Server Error.
Reload the page and assert that a prompt banner 'Unable to load profile' and an interactive 'Retry' button are visible.`
  }
];
