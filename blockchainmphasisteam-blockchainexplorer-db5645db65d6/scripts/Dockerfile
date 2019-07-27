FROM python:3

WORKDIR /usr/src/app

COPY . .

#RUN echo '172.20.17.242 \t btpproxy.mphasis.com' >> /etc/hosts;echo $http_proxy;pip --proxy=http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080  --trusted-host pypi.org --trusted-host files.pythonhosted.org install -r requirements.txt;
RUN pip install -r requirements.txt;

CMD ["./startSyncAPI.sh"]