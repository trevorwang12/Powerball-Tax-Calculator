#!/usr/bin/env python3
"""
Generate search engine optimized favicon files
Following Google and Bing favicon guidelines
"""

from PIL import Image, ImageDraw
import os

def create_optimized_favicons():
    """Create favicons with proper sizes for search engines"""

    # Define sizes following Google's recommendation (48x48 multiples)
    sizes = [48, 96, 144, 192]

    # Colors matching the website theme
    bg_color = '#d97706'  # Amber orange
    ball_color = '#ffffff'  # White
    stripe_color = '#d97706'  # Orange stripe
    border_color = '#374151'  # Dark border

    for size in sizes:
        # Create image
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Calculate proportional sizes
        center = size // 2
        ball_radius = int(size * 0.35)  # 35% of image size
        stripe_height = int(size * 0.15)  # 15% of image size
        border_width = max(1, size // 32)  # Proportional border

        # Draw background circle (ball)
        ball_bbox = [
            center - ball_radius,
            center - ball_radius,
            center + ball_radius,
            center + ball_radius
        ]
        draw.ellipse(ball_bbox, fill=ball_color, outline=border_color, width=border_width)

        # Draw horizontal stripe
        stripe_y1 = center - stripe_height // 2
        stripe_y2 = center + stripe_height // 2
        stripe_bbox = [
            center - ball_radius + border_width,
            stripe_y1,
            center + ball_radius - border_width,
            stripe_y2
        ]
        draw.rectangle(stripe_bbox, fill=stripe_color)

        # Draw number "8" if size is large enough
        if size >= 48:
            try:
                from PIL import ImageFont
                # Try to use a system font, fallback to default
                try:
                    font_size = max(8, size // 4)
                    font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()

                # Get text dimensions
                bbox = draw.textbbox((0, 0), "8", font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]

                # Center the text
                text_x = center - text_width // 2
                text_y = center - text_height // 2

                draw.text((text_x, text_y), "8", fill=border_color, font=font)
            except ImportError:
                # If PIL doesn't have font support, just draw a simple "8"
                pass

        # Save PNG versions
        img.save(f'favicon-{size}x{size}.png', 'PNG')
        print(f"✅ Created favicon-{size}x{size}.png")

    # Create the main favicon.ico with multiple sizes
    # Use the 48x48 as the primary size for better search engine compatibility
    primary_img = Image.open('favicon-48x48.png')
    primary_img.save('favicon.ico', format='ICO', sizes=[(48, 48)])
    print("✅ Created optimized favicon.ico (48x48)")

    # Create apple-touch-icon (180x180 is standard)
    apple_icon = Image.open('favicon-192x192.png')
    apple_icon = apple_icon.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save('apple-touch-icon.png', 'PNG')
    print("✅ Created apple-touch-icon.png (180x180)")

    # Clean up individual PNG files (keep only the ones we need)
    for size in sizes:
        if size != 192:  # Keep 192 for web manifest
            os.remove(f'favicon-{size}x{size}.png')

    print("\n✅ All optimized favicon files created successfully!")
    print("Files created:")
    print("- favicon.ico (48x48 - optimized for search engines)")
    print("- favicon.svg (vector version)")
    print("- apple-touch-icon.png (180x180)")
    print("- favicon-192x192.png (for web manifest)")

if __name__ == "__main__":
    create_optimized_favicons()