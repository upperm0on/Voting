#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voting_ksts.settings')
    
    # Custom helper to print network information and bind to all interfaces on runserver
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        import socket
        def get_local_ip():
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                s.connect(('10.255.255.255', 1))
                IP = s.getsockname()[0]
            except Exception:
                IP = '127.0.0.1'
            finally:
                s.close()
            return IP

        local_ip = get_local_ip()
        
        # Check if user specified a custom bind address (containing a colon or non-digits)
        # If not, or if they only provided a port (like '1234'), bind to '0.0.0.0' for local network exposure
        custom_bind = False
        port_only = False
        port = '1234'
        
        for arg in sys.argv[2:]:
            if not arg.startswith('-'):
                if ':' in arg:
                    custom_bind = True
                elif arg.isdigit():
                    port_only = True
                    port = arg
                else:
                    custom_bind = True
                    
        if not custom_bind:
            # Remove port-only arguments
            if port_only:
                sys.argv = [arg for arg in sys.argv if not arg.isdigit()]
            sys.argv.append(f'0.0.0.0:{port}')
            
        print("\n" + "=" * 65)
        print("🗳️  KsTS Ballot System - Local Network Mode  🗳️")
        print("=" * 65)
        print("Backend server is binding to all network interfaces.")
        print(f"\n💻 On this computer:")
        print(f"   Frontend: http://localhost:5173")
        print(f"   Backend:  http://localhost:{port}")
        print(f"\n📱 On other devices (smartphones/tablets on the same Wi-Fi):")
        print(f"   Frontend: http://{local_ip}:5173")
        print(f"   Backend:  http://{local_ip}:{port}")
        print("\nNote: Make sure your firewall allows incoming connections on these ports!")
        print("=" * 65 + "\n")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
