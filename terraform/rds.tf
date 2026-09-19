resource "aws_db_subnet_group" "main" {
  name       = "secureauth-demo-db-subnet"
  subnet_ids = [aws_subnet.public.id]

  tags = {
    Name = "secureauth-demo-db-subnet-group"
  }
}

# HIGH: Publicly accessible RDS with no encryption at rest
resource "aws_db_instance" "main" {
  identifier        = "secureauth-demo-db"
  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "secureauth"
  username = "secureauth_admin"
  password = var.db_password

  publicly_accessible    = true
  storage_encrypted      = false
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.app.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  tags = {
    Name        = "secureauth-demo-db"
    Environment = var.environment
  }
}

# LOW: No CloudTrail or enhanced monitoring configured
