# Use the official Nginx image as the base
FROM nginx:latest

# Copy your static files into the appropriate directory
COPY /frontend/dist /usr/share/nginx/html

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]