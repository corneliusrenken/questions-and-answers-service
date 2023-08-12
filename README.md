E-commerce back end rebuilt to handle web-scale traffic

_Scaled to handle 300% more throughput_

## Features
- Redesigned the [PostgreSQL](https://www.postgresql.org/) schema
- Optimized SQL queries to handle large tables efficiently (3M+ rows)
- Hosted on [AWS EC2](https://aws.amazon.com/ec2/) instances
- Implemented response caching with [NGINX](https://www.nginx.com/) to meet optimization goals
- Scaled horizontally using NGINX's load balancer to combat the initial performance spike when being flooded with requests
- Benchmarked database performance using [K6](https://k6.io/)
- Benchmarked AWS instance vitals and performance using [New Relic](https://newrelic.com/) and [Loader.io](https://loader.io/)
