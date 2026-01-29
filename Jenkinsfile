pipeline {
    agent any

    environment {
        IMAGE_NAME = "app"
        REGISTRY = "192.168.56.128:50000"
        TAG = "v${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                deleteDir()
                git branch: 'main',
                    url: 'https://github.com/Mayochiki03/ci-cd-ha-demo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t app:${TAG} .'
            }
        }

        stage('Tag Image') {
            steps {
                sh 'docker tag app:${TAG} ${REGISTRY}/app:${TAG}'
            }
        }

        stage('Push Image to Nexus') {
            steps {
                sh 'docker push ${REGISTRY}/app:${TAG}'
            }
        }

        stage('Deploy to VM2') {
            steps {
                sh '''
                ssh mayo@192.168.56.129 "
                  docker pull ${REGISTRY}/app:${TAG} &&
                  docker stop app || true &&
                  docker rm app || true &&
                  docker run -d --name app -p 3001:3000 ${REGISTRY}/app:${TAG}
                "
                '''
            }
        }

        stage('Deploy to VM3') {
            steps {
                sh '''
                ssh mayo@192.168.56.130 "
                  docker pull ${REGISTRY}/app:${TAG} &&
                  docker stop app || true &&
                  docker rm app || true &&
                  docker run -d --name app -p 3001:3000 ${REGISTRY}/app:${TAG}
                "
                '''
            }
        }

        stage('Reload Nginx') {
            steps {
                sh 'ssh mayo@192.168.56.128 "sudo systemctl reload nginx"'
            }
        }
    }
}

