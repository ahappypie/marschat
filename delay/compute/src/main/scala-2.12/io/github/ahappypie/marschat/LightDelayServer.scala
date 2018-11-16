package io.github.ahappypie.marschat

import java.util.logging.Logger

import io.grpc.{Server, ServerBuilder}
import io.github.ahappypie.marschat.grpc.delay.{LightDelayGrpc, LightDelayRequest, LightDelayResponse}

import scala.concurrent.{ExecutionContext, Future}

object LightDelayServer {
  private val logger = Logger.getLogger(classOf[LightDelayServer].getName)

  def main(args: Array[String]): Unit = {
    val server = new LightDelayServer(ExecutionContext.global)
    server.start()
    server.blockUntilShutdown()
  }

  private val port = sys.env.getOrElse("LIGHT_DELAY_GRPC_PORT", "50051").toInt
}

class LightDelayServer(executionContext: ExecutionContext) { self =>
  private[this] var server: Server = null

  private def start(): Unit = {
    server = ServerBuilder.forPort(LightDelayServer.port).addService(LightDelayGrpc.bindService(new LightDelayImpl, executionContext)).build.start
    LightDelayServer.logger.info("Server started, listening on " + LightDelayServer.port)
    sys.addShutdownHook {
      System.err.println("*** shutting down gRPC server since JVM is shutting down")
      self.stop()
      System.err.println("*** server shut down")
    }
  }

  private def stop(): Unit = {
    if (server != null) {
      server.shutdown()
    }
  }

  private def blockUntilShutdown(): Unit = {
    if (server != null) {
      server.awaitTermination()
    }
  }

  private class LightDelayImpl extends LightDelayGrpc.LightDelay {
    override def getLightDelay(req: LightDelayRequest) = {
      val reply = LightDelayResponse(delay = 1)
      Future.successful(reply)
    }
  }

}