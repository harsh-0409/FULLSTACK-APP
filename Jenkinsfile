pipeline {
    agent any

    environment {
        TOMCAT_HOME = 'C:\\Program Files\\Apache Software Foundation\\Tomcat 10.1'
        WEBAPPS     = "${TOMCAT_HOME}\\webapps"
        MAVEN_REPO  = 'C:\\maven-repo'
    }

    options {
        timestamps()
    }

    stages {

        // ===== FRONTEND BUILD =====
        stage('Build Frontend') {
            steps {
                dir('EMPLOYEEAPI-REACT') {
                    bat 'npm ci || npm install'
                    bat 'npm run build'
                }
            }
        }

        // ===== FRONTEND DEPLOY =====
        stage('Deploy Frontend to Tomcat') {
            steps {
                bat '''
                if exist "%WEBAPPS%\\reactemployeeapi" (
                    rmdir /S /Q "%WEBAPPS%\\reactemployeeapi"
                )
                mkdir "%WEBAPPS%\\reactemployeeapi"
                xcopy /E /I /Y /Q EMPLOYEEAPI-REACT\\dist\\* "%WEBAPPS%\\reactemployeeapi"
                '''
            }
        }

        // ===== PREP MAVEN CACHE =====
        stage('Prepare Maven Dependencies') {
            steps {
                dir('EMPLOYEEAPI-SPRINGBOOT') {
                    retry(3) {
                        bat 'mvn -B -Dmaven.repo.local=%MAVEN_REPO% -Dorg.apache.maven.wagon.http.retryHandler.count=3 -Dorg.apache.maven.wagon.http.connectionTimeout=60000 -Dorg.apache.maven.wagon.http.readTimeout=120000 dependency:go-offline'
                    }
                }
            }
        }

        // ===== BACKEND BUILD =====
        stage('Build Backend') {
            steps {
                dir('EMPLOYEEAPI-SPRINGBOOT') {
                    retry(3) {
                        bat 'mvn -B -Dmaven.repo.local=%MAVEN_REPO% -DskipTests -Dorg.apache.maven.wagon.http.retryHandler.count=3 -Dorg.apache.maven.wagon.http.connectionTimeout=60000 -Dorg.apache.maven.wagon.http.readTimeout=120000 clean package'
                    }
                }
            }
        }

        // ===== BACKEND DEPLOY =====
        stage('Deploy Backend to Tomcat') {
            steps {
                bat '''
                rem Require a WAR for external Tomcat deployment; fail if not present.
                setlocal ENABLEDELAYEDEXPANSION
                set WAR_FILE=
                for %%f in (EMPLOYEEAPI-SPRINGBOOT\\target\\*.war) do set "WAR_FILE=%%f"

                if not defined WAR_FILE (
                    echo [ERROR] No WAR found in EMPLOYEEAPI-SPRINGBOOT\\target.
                    echo HINT: Update pom.xml to set packaging=WAR and set spring-boot-starter-tomcat scope=provided.
                    echo Also add a Servlet initializer (extends SpringBootServletInitializer) for external Tomcat.
                    endlocal
                    exit /b 1
                )

                echo Deploying WAR: %WAR_FILE%
                if exist "%WEBAPPS%\\employeeapi.war" del /Q "%WEBAPPS%\\employeeapi.war"
                if exist "%WEBAPPS%\\employeeapi" rmdir /S /Q "%WEBAPPS%\\employeeapi"
                copy /Y "%WAR_FILE%" "%WEBAPPS%\\employeeapi.war"
                endlocal
                '''
            }
        }

    }

    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Pipeline Failed.'
        }
    }
}