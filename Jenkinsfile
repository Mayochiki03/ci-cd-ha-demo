pipeline {
    agent any

    options {
        skipDefaultCheckout(true)  
    }

    environment {
        REGISTRY = "192.168.56.128:50000"
        IMAGE_NAME = "app"
        TAG = "latest"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "==> Checkout source code"
                deleteDir()
                git branch: 'main',
                    url: 'https://github.com/Mayochiki03/ci-cd-ha-demo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "==> Build Docker image"
                sh """
                  docker build -t ${IMAGE_NAME}:${TAG} .
                """
            }
        }

        stage('Tag Image') {
            steps {
                echo "==> Tag image for Nexus"
                sh """
                  docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}/${IMAGE_NAME}:${TAG}
                """
            }
        }

        stage('Push Image to Nexus') {
            steps {
                echo "==> Push image to Nexus"
                sh """
                  docker push ${REGISTRY}/${IMAGE_NAME}:${TAG}
                """
            }
        }

        stage('Deploy to VM2') {
            steps {
                echo "==> Deploy to VM2"
                sh """
                  ssh -o StrictHostKeyChecking=no mayo@app-server-1 '
                    docker pull ${REGISTRY}/${IMAGE_NAME}:${TAG} &&
                    docker stop app || true &&
                    docker rm app || true &&
                    docker run -d --name app -p 3000:3000 ${REGISTRY}/${IMAGE_NAME}:${TAG}
                  '
                """
            }
        }

        stage('Deploy to VM3') {
            steps {
                echo "==> Deploy to VM3"
                sh """
                  ssh -o StrictHostKeyChecking=no mayo@app-server-2 '
                    docker pull ${REGISTRY}/${IMAGE_NAME}:${TAG} &&
                    docker stop app || true &&
                    docker rm app || true &&
                    docker run -d --name app -p 3000:3000 ${REGISTRY}/${IMAGE_NAME}:${TAG}
                  '
                """
            }
        }

        stage('Reload Nginx') {
            steps {
                echo "==> Reload Nginx"
                sh """
                  sudo systemctl reload nginx
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS: Deploy completed with zero downtime"
        }
        failure {
            echo "Pipeline FAILED: Please check logs"
        }
    }
}
