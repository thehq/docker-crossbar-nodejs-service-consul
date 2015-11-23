FROM thehq/crossbar:0.11.1
MAINTAINER Eric Chapman <eric@thehq.io>

# pip
RUN pip install \
  wamptest

COPY *.py /app/

COPY test.sh /app/test.sh
RUN chmod +x /app/test.sh

ENTRYPOINT "/app/test.sh"