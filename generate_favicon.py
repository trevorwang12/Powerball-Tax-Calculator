#!/usr/bin/env python3
"""
Generate a simple favicon.ico file for the Powerball Calculator
"""

import struct

def create_simple_favicon():
    """Create a 16x16 favicon with 8-ball inspired design"""

    # ICO file header (6 bytes)
    # 0-1: Reserved (0)
    # 2-3: Type (1 for ICO)
    # 4-5: Number of images (1)
    header = struct.pack('<HHH', 0, 1, 1)

    # Image directory entry (16 bytes)
    # 0: Width (16)
    # 1: Height (16)
    # 2: Colors (0 = >256 colors)
    # 3: Reserved (0)
    # 4-5: Color planes (1)
    # 6-7: Bits per pixel (32)
    # 8-11: Image size in bytes
    # 12-15: Offset to image data

    # Calculate image size: 16x16 pixels * 4 bytes (RGBA) + 40 byte header
    image_size = 16 * 16 * 4 + 40
    offset = 6 + 16  # Header + directory entry

    directory = struct.pack('<BBBBHHLL', 16, 16, 0, 0, 1, 32, image_size, offset)

    # BMP header (40 bytes)
    bmp_header = struct.pack('<LLLHHLLLLLL',
        40,     # Header size
        16,     # Width
        32,     # Height (doubled for ICO format)
        1,      # Planes
        32,     # Bits per pixel
        0,      # Compression
        16*16*4, # Image size
        0,      # X pixels per meter
        0,      # Y pixels per meter
        0,      # Colors used
        0       # Important colors
    )

    # Create pixel data (16x16 BGRA format, bottom-up)
    pixels = []

    # Define colors (BGRA format)
    bg_color = (0x06, 0x77, 0xd9, 0xFF)  # Orange background
    ball_color = (0xFF, 0xFF, 0xFF, 0xFF)  # White ball
    stripe_color = (0x06, 0x77, 0xd9, 0xFF)  # Orange stripe
    number_color = (0xFF, 0xFF, 0xFF, 0xFF)  # White number

    # Generate 16x16 bitmap (stored bottom-up for ICO)
    for y in range(15, -1, -1):  # Bottom-up
        for x in range(16):
            # Calculate distance from center for circle
            dx = x - 8
            dy = y - 8
            distance = (dx * dx + dy * dy) ** 0.5

            if distance <= 6:  # Inside ball
                if 6 <= y <= 9:  # Horizontal stripe
                    pixels.extend(stripe_color)
                elif 7 <= y <= 8 and 6 <= x <= 9:  # Number "8" area (simplified)
                    pixels.extend(number_color)
                else:
                    pixels.extend(ball_color)
            else:
                pixels.extend(bg_color)

    # Write the ICO file
    with open('favicon.ico', 'wb') as f:
        f.write(header)
        f.write(directory)
        f.write(bmp_header)
        f.write(bytes(pixels))

    print("✅ favicon.ico created successfully!")

if __name__ == "__main__":
    create_simple_favicon()