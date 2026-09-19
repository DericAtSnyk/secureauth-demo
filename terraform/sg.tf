resource "aws_security_group" "app" {
  name        = "secureauth-demo-app-sg"
  description = "Security group for SecureAuth Demo application"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "secureauth-demo-app-sg"
  }
}

# CRITICAL: SSH open to the world
resource "aws_security_group_rule" "ssh_ingress" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
  description       = "Allow SSH from anywhere"
}

# CRITICAL: PostgreSQL open to the world
resource "aws_security_group_rule" "postgres_ingress" {
  type              = "ingress"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
  description       = "Allow PostgreSQL from anywhere"
}

resource "aws_security_group_rule" "app_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
}
